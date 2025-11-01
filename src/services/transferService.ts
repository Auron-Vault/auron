import { Asset } from '../context/WalletContext';
import {
  SigningKey,
  getBytes,
  sha256,
  ripemd160,
  hexlify,
  concat,
} from 'ethers';
import { bech32 } from 'bech32';
import { ETHEREUM_RPC_URL, BSC_RPC_URL, SOLANA_RPC_URL } from '@env';

/**
 * Transfer Service
 * Handles sending transactions for different blockchain networks
 */

// Transfer result interface
export interface TransferResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

// Transfer parameters interface
export interface TransferParams {
  asset: Asset;
  fromAddress: string;
  toAddress: string;
  amount: number;
  privateKey: string; // Hex format private key with 0x prefix
}

// UTXO interface for Bitcoin transactions
interface UTXO {
  txid: string;
  vout: number;
  value: number; // in satoshis
  scriptPubKey?: string;
}

/**
 * Fetch UTXOs for a Bitcoin address
 * Uses blockchain API to get unspent transaction outputs
 */
const fetchBitcoinUTXOs = async (address: string): Promise<UTXO[]> => {
  try {
    // Using BlockCypher API (free tier: 200 requests/hour)
    const response = await fetch(
      `https://api.blockcypher.com/v1/btc/main/addrs/${address}?unspentOnly=true`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch UTXOs: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.txrefs || data.txrefs.length === 0) {
      return [];
    }

    return data.txrefs.map((utxo: any) => ({
      txid: utxo.tx_hash,
      vout: utxo.tx_output_n,
      value: utxo.value, // already in satoshis
    }));
  } catch (error) {
    console.error('Error fetching Bitcoin UTXOs:', error);
    throw error;
  }
};

/**
 * Broadcast Bitcoin transaction to the network
 */
const broadcastBitcoinTransaction = async (txHex: string): Promise<string> => {
  try {
    // Using BlockCypher API to broadcast
    const response = await fetch(
      'https://api.blockcypher.com/v1/btc/main/txs/push',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tx: txHex }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Broadcast failed: ${error.error || response.statusText}`,
      );
    }

    const result = await response.json();
    return result.tx.hash;
  } catch (error) {
    console.error('Error broadcasting Bitcoin transaction:', error);
    throw error;
  }
};

/**
 * Helper: Convert integer to little-endian bytes
 */
const toLEBytes = (num: number, bytes: number): Uint8Array => {
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < bytes; i++) {
    arr[i] = num & 0xff;
    num = num >> 8;
  }
  return arr;
};

/**
 * Helper: Reverse bytes (for Bitcoin txid/hash)
 */
const reverseBytes = (hex: string): string => {
  const bytes = getBytes('0x' + hex);
  return hexlify(bytes.reverse()).slice(2);
};

/**
 * Helper: Create SegWit script for P2WPKH
 */
const createP2WPKHScript = (pubKeyHash: Uint8Array): Uint8Array => {
  // OP_0 <20-byte-pubkey-hash>
  return getBytes(concat([new Uint8Array([0x00, 0x14]), pubKeyHash]));
};

/**
 * Helper: Create scriptCode for P2WPKH signing (BIP143)
 * This is the P2PKH equivalent script used in the sighash preimage
 */
const createP2PKHScriptCode = (pubKeyHash: Uint8Array): Uint8Array => {
  // 0x1976a914{20-byte-pubkey-hash}88ac
  // OP_DUP OP_HASH160 <20-byte-hash> OP_EQUALVERIFY OP_CHECKSIG
  return getBytes(
    concat([
      new Uint8Array([0x19]), // Length: 25 bytes
      new Uint8Array([0x76]), // OP_DUP
      new Uint8Array([0xa9]), // OP_HASH160
      new Uint8Array([0x14]), // Push 20 bytes
      pubKeyHash,
      new Uint8Array([0x88]), // OP_EQUALVERIFY
      new Uint8Array([0xac]), // OP_CHECKSIG
    ]),
  );
};

/**
 * Helper: Encode varint
 */
const encodeVarint = (num: number): Uint8Array => {
  if (num < 0xfd) {
    return new Uint8Array([num]);
  } else if (num <= 0xffff) {
    return getBytes(concat([new Uint8Array([0xfd]), toLEBytes(num, 2)]));
  } else if (num <= 0xffffffff) {
    return getBytes(concat([new Uint8Array([0xfe]), toLEBytes(num, 4)]));
  } else {
    return getBytes(concat([new Uint8Array([0xff]), toLEBytes(num, 8)]));
  }
};

/**
 * Helper: Convert signature to DER format
 * Bitcoin requires DER encoding for signatures and low-s values (BIP 62)
 */
const toDERSignature = (r: string, s: string): Uint8Array => {
  // Remove 0x prefix if present
  const rHex = r.startsWith('0x') ? r.slice(2) : r;
  let sHex = s.startsWith('0x') ? s.slice(2) : s;

  // Secp256k1 curve order (n)
  const n = BigInt(
    '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141',
  );
  const halfN = n / 2n;

  // Enforce low-s (BIP 62) - if s > n/2, use n - s
  let sBigInt = BigInt('0x' + sHex);
  if (sBigInt > halfN) {
    sBigInt = n - sBigInt;
    sHex = sBigInt.toString(16).padStart(64, '0');
  }

  let rBytes = getBytes('0x' + rHex);
  let sBytes = getBytes('0x' + sHex);

  // Add leading 0x00 if high bit is set (to keep it positive)
  if (rBytes[0] & 0x80) {
    rBytes = getBytes(concat([new Uint8Array([0x00]), rBytes]));
  }
  if (sBytes[0] & 0x80) {
    sBytes = getBytes(concat([new Uint8Array([0x00]), sBytes]));
  }

  // Remove leading zeros (but keep one zero if needed for sign)
  while (rBytes.length > 1 && rBytes[0] === 0x00 && !(rBytes[1] & 0x80)) {
    rBytes = rBytes.slice(1);
  }
  while (sBytes.length > 1 && sBytes[0] === 0x00 && !(sBytes[1] & 0x80)) {
    sBytes = sBytes.slice(1);
  }

  // Build DER structure: 0x30 [total-length] 0x02 [r-length] [r] 0x02 [s-length] [s]
  const derSig = concat([
    new Uint8Array([0x30]), // DER sequence tag
    new Uint8Array([rBytes.length + sBytes.length + 4]), // total length
    new Uint8Array([0x02]), // integer tag for r
    new Uint8Array([rBytes.length]), // r length
    rBytes,
    new Uint8Array([0x02]), // integer tag for s
    new Uint8Array([sBytes.length]), // s length
    sBytes,
  ]);

  // Return as Uint8Array since concat returns hex string
  return getBytes(derSig);
};

/**
 * Bitcoin Transfer
 * Handles BTC transactions on Bitcoin network using native SegWit (P2WPKH)
 * Manual implementation using ethers for signing
 */
export const transferBitcoin = async (
  params: TransferParams,
): Promise<TransferResult> => {
  const { asset, fromAddress, toAddress, amount, privateKey } = params;

  try {
    // Validate Bitcoin address
    if (
      !toAddress.startsWith('bc1') &&
      !toAddress.startsWith('1') &&
      !toAddress.startsWith('3')
    ) {
      throw new Error('Invalid Bitcoin address');
    }

    // Convert amount from BTC to satoshis
    const satoshis = Math.floor(amount * 100000000);

    // Fetch UTXOs for the address
    const utxos = await fetchBitcoinUTXOs(fromAddress);

    if (utxos.length === 0) {
      throw new Error('No UTXOs available for this address');
    }

    // Calculate total available balance
    const totalBalance = utxos.reduce((sum, utxo) => sum + utxo.value, 0);

    // Estimate fee (simple estimation: 10 sat/vbyte, ~140 vbytes for basic tx)
    const estimatedFee = 1400; // 140 vbytes * 10 sat/vbyte
    const totalRequired = satoshis + estimatedFee;

    if (totalBalance < totalRequired) {
      throw new Error(
        `Insufficient balance. Required: ${totalRequired} sats, Available: ${totalBalance} sats`,
      );
    }

    // Normalize private key
    let normalizedPrivateKey = privateKey;
    if (normalizedPrivateKey.startsWith('0x0x')) {
      normalizedPrivateKey = '0x' + normalizedPrivateKey.slice(4);
    } else if (!normalizedPrivateKey.startsWith('0x')) {
      normalizedPrivateKey = '0x' + normalizedPrivateKey;
    }

    // Create signing key from private key
    const signingKey = new SigningKey(normalizedPrivateKey);
    const compressedPublicKey = signingKey.compressedPublicKey;
    const publicKeyBytes = getBytes(compressedPublicKey);

    // Calculate pubkey hash for scriptPubKey
    const sha256Hash = sha256(publicKeyBytes);
    const pubKeyHash = getBytes(ripemd160(sha256Hash));

    // Verify the derived address matches fromAddress
    const witnessProgram = pubKeyHash;
    const derivedAddress = bech32.encode('bc', [
      0,
      ...bech32.toWords(witnessProgram),
    ]);

    if (derivedAddress !== fromAddress) {
      throw new Error(
        `Private key mismatch! Expected address: ${fromAddress}, Derived: ${derivedAddress}`,
      );
    }

    console.log('Address verification passed:', {
      fromAddress,
      derivedAddress,
      publicKey: compressedPublicKey,
    });

    // Select UTXOs
    let inputTotal = 0;
    const inputsToUse: UTXO[] = [];

    for (const utxo of utxos) {
      inputsToUse.push(utxo);
      inputTotal += utxo.value;
      if (inputTotal >= totalRequired) {
        break;
      }
    }

    // Decode destination address
    let outputScript: Uint8Array;
    if (toAddress.startsWith('bc1')) {
      // Bech32 (native SegWit)
      const decoded = bech32.decode(toAddress);
      const witnessVersion = decoded.words[0];
      const witnessProgram = bech32.fromWords(decoded.words.slice(1));
      outputScript = getBytes(
        concat([
          new Uint8Array([witnessVersion, witnessProgram.length]),
          new Uint8Array(witnessProgram),
        ]),
      );
    } else {
      throw new Error(
        'Only native SegWit (bc1...) addresses supported for now',
      );
    }

    // Build transaction
    const version = toLEBytes(2, 4);
    const marker = new Uint8Array([0x00]);
    const flag = new Uint8Array([0x01]);
    const inputCount = encodeVarint(inputsToUse.length);

    // Build inputs
    const inputs: Uint8Array[] = [];
    for (const utxo of inputsToUse) {
      const txidBytes = getBytes('0x' + reverseBytes(utxo.txid));
      const voutBytes = toLEBytes(utxo.vout, 4);
      const scriptSigLength = new Uint8Array([0x00]);
      const sequence = new Uint8Array([0xff, 0xff, 0xff, 0xff]);
      inputs.push(
        getBytes(concat([txidBytes, voutBytes, scriptSigLength, sequence])),
      );
    }

    // Calculate change
    const change = inputTotal - totalRequired;
    const outputCount = change > 546 ? encodeVarint(2) : encodeVarint(1);

    // Build outputs
    const outputs: Uint8Array[] = [];

    // Recipient output
    const recipientValue = toLEBytes(satoshis, 8);
    const recipientScriptLength = encodeVarint(outputScript.length);
    outputs.push(
      getBytes(concat([recipientValue, recipientScriptLength, outputScript])),
    );

    // Change output
    if (change > 546) {
      const changeValue = toLEBytes(change, 8);
      const changeScript = createP2WPKHScript(pubKeyHash);
      const changeScriptLength = encodeVarint(changeScript.length);
      outputs.push(
        getBytes(concat([changeValue, changeScriptLength, changeScript])),
      );
    }

    // Build witness data for each input
    const witnesses: Uint8Array[] = [];
    for (let i = 0; i < inputsToUse.length; i++) {
      // scriptCode for P2WPKH is the P2PKH equivalent
      const scriptCode = createP2PKHScriptCode(pubKeyHash);

      const hashPrevouts = sha256(
        sha256(
          concat(
            inputsToUse.map(u =>
              concat([
                getBytes('0x' + reverseBytes(u.txid)),
                toLEBytes(u.vout, 4),
              ]),
            ),
          ),
        ),
      );

      const hashSequence = sha256(
        sha256(
          concat(
            inputsToUse.map(() => new Uint8Array([0xff, 0xff, 0xff, 0xff])),
          ),
        ),
      );

      const hashOutputs = sha256(sha256(concat(outputs)));

      // BIP143 preimage
      const preimage = concat([
        version,
        hashPrevouts,
        hashSequence,
        getBytes('0x' + reverseBytes(inputsToUse[i].txid)),
        toLEBytes(inputsToUse[i].vout, 4),
        scriptCode,
        toLEBytes(inputsToUse[i].value, 8),
        new Uint8Array([0xff, 0xff, 0xff, 0xff]),
        hashOutputs,
        toLEBytes(0, 4), // locktime
        toLEBytes(1, 4), // SIGHASH_ALL
      ]);

      console.log(`Signing input ${i}:`, {
        txid: inputsToUse[i].txid,
        vout: inputsToUse[i].vout,
        value: inputsToUse[i].value,
        scriptCodeLength: scriptCode.length,
        preimageHex: hexlify(preimage),
      });

      // Sign
      const sighash = sha256(sha256(preimage));
      const signature = signingKey.sign(sighash);

      // Convert to DER with low-s
      const derSig = toDERSignature(signature.r, signature.s);
      // Append SIGHASH_ALL (0x01) - use hexlify since concat expects hex strings
      const derSigWithHashType = getBytes(hexlify(derSig) + '01');

      console.log(`Signature for input ${i}:`, {
        r: signature.r,
        s: signature.s,
        derSigHex: hexlify(derSig),
        derSigLength: derSig.length,
        derSigWithHashTypeHex: hexlify(derSigWithHashType),
        derSigWithHashTypeLength: derSigWithHashType.length,
        pubKeyLength: publicKeyBytes.length,
      });

      // Witness data for this input
      // Format: [item_count] [sig_length] [sig] [pubkey_length] [pubkey]
      const witnessStack = concat([
        new Uint8Array([0x02]), // 2 witness items
        new Uint8Array([derSigWithHashType.length]), // signature length
        derSigWithHashType, // signature with SIGHASH_ALL
        new Uint8Array([publicKeyBytes.length]), // pubkey length
        publicKeyBytes, // compressed public key
      ]);

      witnesses.push(getBytes(witnessStack));
    }

    const locktime = toLEBytes(0, 4);

    // Assemble transaction
    const tx = concat([
      version,
      marker,
      flag,
      inputCount,
      ...inputs,
      outputCount,
      ...outputs,
      ...witnesses,
      locktime,
    ]);

    const txHex = hexlify(tx).slice(2);

    console.log('Transaction details:', {
      inputs: inputsToUse.length,
      outputs: change > 546 ? 2 : 1,
      fee: estimatedFee,
      txSize: txHex.length / 2,
      txHex: txHex,
      utxos: inputsToUse.map(u => ({
        txid: u.txid,
        vout: u.vout,
        value: u.value,
      })),
    });

    console.log('Transaction built:', {
      inputs: inputsToUse.length,
      outputs: change > 546 ? 2 : 1,
      fee: estimatedFee,
      txSize: txHex.length / 2,
    });

    // Broadcast transaction
    const txHash = await broadcastBitcoinTransaction(txHex);

    console.log('Bitcoin transfer successful:', {
      txHash,
      amount: `${amount} BTC`,
      from: fromAddress,
      to: toAddress,
    });

    return {
      success: true,
      txHash,
    };
  } catch (error) {
    console.error('Bitcoin transfer error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Ethereum Transfer
 * Handles ETH transactions on Ethereum network
 */
/**
 * Ethereum Transfer
 * Handles ETH transactions on Ethereum network
 */
export const transferEthereum = async (
  params: TransferParams,
): Promise<TransferResult> => {
  const { fromAddress, toAddress, amount, privateKey } = params;

  try {
    // Import ethers utilities
    const { Wallet, JsonRpcProvider, parseEther, formatEther } = await import(
      'ethers'
    );

    // Use dedicated RPC with fallbacks
    const rpcEndpoints = [
      ETHEREUM_RPC_URL,
      'https://eth.llamarpc.com',
      'https://ethereum-mainnet.gateway.tatum.io',
      'https://api.zan.top/eth-mainnet',
      'https://eth-mainnet.public.blastapi.io',
      'https://eth.drpc.org',
      'https://cloudflare-eth.com',
      'https://1rpc.io/eth',
    ];

    let provider: any = null;
    let lastError: Error | null = null;

    // Try each RPC endpoint until one works
    for (const rpcUrl of rpcEndpoints) {
      try {
        provider = new JsonRpcProvider(rpcUrl);
        // Test the connection
        await provider.getBlockNumber();
        console.log(`Connected to Ethereum via: ${rpcUrl}`);
        break;
      } catch (err) {
        console.warn(`Failed to connect to ${rpcUrl}:`, err);
        lastError = err as Error;
        provider = null;
      }
    }

    if (!provider) {
      throw new Error(
        `Failed to connect to Ethereum network. Last error: ${lastError?.message}`,
      );
    }

    // Create wallet instance from private key
    const wallet = new Wallet(privateKey, provider);

    // Verify the wallet address matches fromAddress
    if (wallet.address.toLowerCase() !== fromAddress.toLowerCase()) {
      throw new Error('Private key does not match sender address');
    }

    // Convert amount to Wei (1 ETH = 10^18 Wei)
    const valueInWei = parseEther(amount.toString());

    // Get current gas price and nonce
    const feeData = await provider.getFeeData();
    const nonce = await provider.getTransactionCount(fromAddress);

    // Build transaction object
    const tx = {
      to: toAddress,
      value: valueInWei,
      nonce: nonce,
      gasLimit: 21000n, // Standard ETH transfer gas limit
      maxFeePerGas: feeData.maxFeePerGas || undefined,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || undefined,
      chainId: 1, // Ethereum mainnet
    };

    // Sign the transaction
    const signedTx = await wallet.signTransaction(tx);

    // Broadcast transaction to network
    const txResponse = await provider.broadcastTransaction(signedTx);

    console.log('Ethereum transfer submitted:', {
      txHash: txResponse.hash,
      from: fromAddress,
      to: toAddress,
      amount: formatEther(valueInWei),
    });

    return {
      success: true,
      txHash: txResponse.hash,
    };
  } catch (error) {
    console.error('Ethereum transfer error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * ERC-20 Token Transfer
 * Handles USDC, USDT, and other ERC-20 tokens on Ethereum network
 */
export const transferERC20Token = async (
  params: TransferParams,
  tokenContractAddress: string,
  decimals: number = 18,
): Promise<TransferResult> => {
  const { fromAddress, toAddress, amount, privateKey } = params;

  try {
    // Import ethers utilities
    const {
      Wallet,
      JsonRpcProvider,
      Contract,
      parseUnits,
      formatUnits,
      Interface,
    } = await import('ethers');

    // Use dedicated RPC with fallbacks
    const rpcEndpoints = [
      ETHEREUM_RPC_URL,
      'https://eth.llamarpc.com',
      'https://ethereum-mainnet.gateway.tatum.io',
      'https://api.zan.top/eth-mainnet',
      'https://eth-mainnet.public.blastapi.io',
      'https://eth.drpc.org',
      'https://cloudflare-eth.com',
      'https://1rpc.io/eth',
    ];

    let provider: any = null;
    let lastError: Error | null = null;

    // Try each RPC endpoint until one works
    for (const rpcUrl of rpcEndpoints) {
      try {
        provider = new JsonRpcProvider(rpcUrl);
        // Test the connection
        await provider.getBlockNumber();
        console.log(`Connected to Ethereum via: ${rpcUrl}`);
        break;
      } catch (err) {
        console.warn(`Failed to connect to ${rpcUrl}:`, err);
        lastError = err as Error;
        provider = null;
      }
    }

    if (!provider) {
      throw new Error(
        `Failed to connect to Ethereum network. Last error: ${lastError?.message}`,
      );
    }

    // Create wallet instance from private key
    const wallet = new Wallet(privateKey, provider);

    // Verify the wallet address matches fromAddress
    if (wallet.address.toLowerCase() !== fromAddress.toLowerCase()) {
      throw new Error('Private key does not match sender address');
    }

    // ERC-20 ABI for transfer function
    const erc20Abi = [
      'function transfer(address to, uint256 amount) returns (bool)',
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
    ];

    // Create contract instance
    const tokenContract = new Contract(tokenContractAddress, erc20Abi, wallet);

    // Convert amount to token's smallest unit (e.g., USDC has 6 decimals)
    const amountInSmallestUnit = parseUnits(amount.toString(), decimals);

    // Check balance
    const balance = await tokenContract.balanceOf(fromAddress);
    if (balance < amountInSmallestUnit) {
      throw new Error(
        `Insufficient balance. Have: ${formatUnits(
          balance,
          decimals,
        )}, Need: ${amount}`,
      );
    }

    // Get current gas price and nonce
    const feeData = await provider.getFeeData();

    // Estimate gas for the transfer
    const gasEstimate = await tokenContract.transfer.estimateGas(
      toAddress,
      amountInSmallestUnit,
    );

    // Execute transfer with gas settings
    const tx = await tokenContract.transfer(toAddress, amountInSmallestUnit, {
      gasLimit: (gasEstimate * 120n) / 100n, // Add 20% buffer
      maxFeePerGas: feeData.maxFeePerGas || undefined,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || undefined,
    });

    console.log('ERC-20 transfer submitted:', {
      txHash: tx.hash,
      from: fromAddress,
      to: toAddress,
      amount: formatUnits(amountInSmallestUnit, decimals),
      contract: tokenContractAddress,
    });

    return {
      success: true,
      txHash: tx.hash,
    };
  } catch (error) {
    console.error('ERC-20 transfer error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * BNB Smart Chain Transfer
 * Handles BNB transactions on BSC network (native BNB, not ERC-20)
 */
export const transferBNB = async (
  params: TransferParams,
): Promise<TransferResult> => {
  const { fromAddress, toAddress, amount, privateKey } = params;

  try {
    // Import ethers utilities
    const { Wallet, JsonRpcProvider, parseEther, formatEther } = await import(
      'ethers'
    );

    // Use dedicated RPC with fallbacks
    const rpcEndpoints = [
      BSC_RPC_URL,
      'https://binance.llamarpc.com',
      'https://rpc-bsc.48.club',
      'https://bsc.blockrazor.xyz',
      'https://bsc.drpc.org',
      'https://bsc-mainnet.public.blastapi.io',
      'https://1rpc.io/bnb',
    ];

    let provider: any = null;
    let lastError: Error | null = null;

    // Try each RPC endpoint until one works
    for (const rpcUrl of rpcEndpoints) {
      try {
        provider = new JsonRpcProvider(rpcUrl);
        // Test the connection
        await provider.getBlockNumber();
        console.log(`Connected to BNB Smart Chain via: ${rpcUrl}`);
        break;
      } catch (err) {
        console.warn(`Failed to connect to ${rpcUrl}:`, err);
        lastError = err as Error;
        provider = null;
      }
    }

    if (!provider) {
      throw new Error(
        `Failed to connect to BNB Smart Chain. Last error: ${lastError?.message}`,
      );
    }

    // Create wallet instance from private key
    const wallet = new Wallet(privateKey, provider);

    // Verify the wallet address matches fromAddress
    if (wallet.address.toLowerCase() !== fromAddress.toLowerCase()) {
      throw new Error('Private key does not match sender address');
    }

    // Convert amount to Wei (1 BNB = 10^18 Wei)
    const valueInWei = parseEther(amount.toString());

    // Get current gas price and nonce
    const feeData = await provider.getFeeData();
    const nonce = await provider.getTransactionCount(fromAddress);

    // Build transaction object
    const tx = {
      to: toAddress,
      value: valueInWei,
      nonce: nonce,
      gasLimit: 21000n, // Standard BNB transfer gas limit
      gasPrice: feeData.gasPrice || undefined, // BSC uses legacy gas pricing
      chainId: 56, // BNB Smart Chain mainnet
    };

    // Sign the transaction
    const signedTx = await wallet.signTransaction(tx);

    // Broadcast transaction to network
    const txResponse = await provider.broadcastTransaction(signedTx);

    console.log('BNB transfer submitted:', {
      txHash: txResponse.hash,
      from: fromAddress,
      to: toAddress,
      amount: formatEther(valueInWei),
    });

    return {
      success: true,
      txHash: txResponse.hash,
    };
  } catch (error) {
    console.error('BNB transfer error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * BEP-20 Token Transfer (BSC network)
 * Handles token transfers on Binance Smart Chain (e.g., USDT on BSC)
 */
export const transferBEP20Token = async (
  params: TransferParams,
  tokenContractAddress: string,
  decimals: number = 18,
): Promise<TransferResult> => {
  const { fromAddress, toAddress, amount, privateKey } = params;

  try {
    // Import ethers utilities
    const {
      Wallet,
      JsonRpcProvider,
      Contract,
      parseUnits,
      formatUnits,
      Interface,
    } = await import('ethers');

    // Use dedicated RPC with fallbacks
    const rpcEndpoints = [
      BSC_RPC_URL,
      'https://binance.llamarpc.com',
      'https://rpc-bsc.48.club',
      'https://bsc.blockrazor.xyz',
      'https://bsc.drpc.org',
      'https://bsc-mainnet.public.blastapi.io',
      'https://1rpc.io/bnb',
    ];

    let provider: any = null;
    let lastError: Error | null = null;

    // Try each RPC endpoint until one works
    for (const rpcUrl of rpcEndpoints) {
      try {
        provider = new JsonRpcProvider(rpcUrl);
        // Test the connection
        await provider.getBlockNumber();
        console.log(`Connected to BSC via: ${rpcUrl}`);
        break;
      } catch (err) {
        console.warn(`Failed to connect to ${rpcUrl}:`, err);
        lastError = err as Error;
        provider = null;
      }
    }

    if (!provider) {
      throw new Error(
        `Failed to connect to BSC network. Last error: ${lastError?.message}`,
      );
    }

    // Create wallet instance from private key
    const wallet = new Wallet(privateKey, provider);

    // Verify the wallet address matches fromAddress
    if (wallet.address.toLowerCase() !== fromAddress.toLowerCase()) {
      throw new Error('Private key does not match sender address');
    }

    // BEP-20 ABI for transfer function (same as ERC-20)
    const bep20Abi = [
      'function transfer(address to, uint256 amount) returns (bool)',
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
    ];

    // Create contract instance
    const tokenContract = new Contract(tokenContractAddress, bep20Abi, wallet);

    // Convert amount to token's smallest unit
    const amountInSmallestUnit = parseUnits(amount.toString(), decimals);

    // Check balance
    const balance = await tokenContract.balanceOf(fromAddress);
    if (balance < amountInSmallestUnit) {
      throw new Error(
        `Insufficient balance. Have: ${formatUnits(
          balance,
          decimals,
        )}, Need: ${amount}`,
      );
    }

    // Get current gas price and nonce
    const feeData = await provider.getFeeData();

    // Estimate gas for the transfer
    const gasEstimate = await tokenContract.transfer.estimateGas(
      toAddress,
      amountInSmallestUnit,
    );

    // Execute transfer with gas settings
    const tx = await tokenContract.transfer(toAddress, amountInSmallestUnit, {
      gasLimit: (gasEstimate * 120n) / 100n, // Add 20% buffer
      maxFeePerGas: feeData.maxFeePerGas || undefined,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || undefined,
    });

    console.log('BEP-20 transfer submitted:', {
      txHash: tx.hash,
      from: fromAddress,
      to: toAddress,
      amount: formatUnits(amountInSmallestUnit, decimals),
      contract: tokenContractAddress,
    });

    return {
      success: true,
      txHash: tx.hash,
    };
  } catch (error) {
    console.error('BEP-20 transfer error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Solana Transfer
 * Handles SOL transactions on Solana network
 */
export const transferSolana = async (
  params: TransferParams,
): Promise<TransferResult> => {
  const { fromAddress, toAddress, amount, privateKey } = params;

  try {
    // Import Solana web3.js
    const {
      Connection,
      PublicKey,
      Transaction,
      SystemProgram,
      LAMPORTS_PER_SOL,
      Keypair,
    } = await import('@solana/web3.js');

    // Import bs58 for private key decoding
    const bs58 = await import('bs58');

    // Use dedicated RPC with fallbacks
    const rpcEndpoints = [
      SOLANA_RPC_URL,
      'https://api.mainnet-beta.solana.com',
      'https://solana-mainnet.rpc.extrnode.com',
      'https://solana.public-rpc.com',
      'https://rpc.ankr.com/solana',
    ];

    let connection: any = null;
    let lastError: Error | null = null;

    // Try each RPC endpoint until one works
    for (const rpcUrl of rpcEndpoints) {
      try {
        connection = new Connection(rpcUrl, 'confirmed');
        // Test the connection
        await connection.getVersion();
        console.log(`Connected to Solana via: ${rpcUrl}`);
        break;
      } catch (err) {
        console.warn(`Failed to connect to ${rpcUrl}:`, err);
        lastError = err as Error;
        connection = null;
      }
    }

    if (!connection) {
      throw new Error(
        `Failed to connect to Solana network. Last error: ${lastError?.message}`,
      );
    }

    // Decode private key
    // Private key can be in hex format (with or without 0x prefix) or base58
    // Solana private keys are 64 bytes (includes both private and public key parts)
    let secretKey: Uint8Array;

    if (privateKey.startsWith('0x')) {
      // Hex format with 0x prefix
      const hexKey = privateKey.slice(2);
      const buffer = Buffer.from(hexKey, 'hex');
      secretKey = Uint8Array.from(buffer);
    } else if (privateKey.length === 128 || privateKey.length === 64) {
      // Hex format without 0x prefix (64 bytes = 128 hex chars)
      const buffer = Buffer.from(privateKey, 'hex');
      secretKey = Uint8Array.from(buffer);
    } else {
      // Base58 format
      secretKey = bs58.default.decode(privateKey);
    }

    // Solana keypair expects 64-byte secret key
    if (secretKey.length !== 64) {
      throw new Error(
        `Invalid Solana private key length: ${secretKey.length} bytes (expected 64)`,
      );
    }

    const fromKeypair = Keypair.fromSecretKey(secretKey);

    // Verify the wallet address matches fromAddress
    if (fromKeypair.publicKey.toString() !== fromAddress) {
      throw new Error(
        `Private key does not match sender address. Expected: ${fromAddress}, Got: ${fromKeypair.publicKey.toString()}`,
      );
    }

    // Create public key for recipient
    const toPubkey = new PublicKey(toAddress);

    // Convert amount to lamports (1 SOL = 1,000,000,000 lamports)
    const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

    // Get recent blockhash for fee calculation
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash('confirmed');

    // Get minimum rent-exempt balance (usually ~0.00089 SOL = 890880 lamports)
    const rentExemptMinimum =
      await connection.getMinimumBalanceForRentExemption(0);
    console.log(
      `Solana rent-exempt minimum: ${rentExemptMinimum / LAMPORTS_PER_SOL} SOL`,
    );

    // Get fee for transaction (Solana fees are typically 5000 lamports = 0.000005 SOL)
    const feeCalculator = await connection.getFeeForMessage(
      new Transaction({
        recentBlockhash: blockhash,
        feePayer: fromKeypair.publicKey,
      })
        .add(
          SystemProgram.transfer({
            fromPubkey: fromKeypair.publicKey,
            toPubkey: new PublicKey(toAddress),
            lamports: lamports,
          }),
        )
        .compileMessage(),
      'confirmed',
    );

    const transactionFee = feeCalculator.value || 5000; // Default to 5000 lamports if unable to calculate
    console.log(
      `Solana transaction fee: ${transactionFee / LAMPORTS_PER_SOL} SOL`,
    );

    // Check balance including fee AND rent-exempt minimum
    const balance = await connection.getBalance(fromKeypair.publicKey);
    const totalRequired = lamports + transactionFee + rentExemptMinimum;

    if (balance < totalRequired) {
      throw new Error(
        `Insufficient balance. Have: ${balance / LAMPORTS_PER_SOL} SOL, Need: ${
          totalRequired / LAMPORTS_PER_SOL
        } SOL (${amount} SOL + ${transactionFee / LAMPORTS_PER_SOL} SOL fee + ${
          rentExemptMinimum / LAMPORTS_PER_SOL
        } SOL rent-exempt reserve)`,
      );
    }

    console.log(
      `Transfer will leave ${
        (balance - totalRequired) / LAMPORTS_PER_SOL
      } SOL in account`,
    );

    // Create transaction
    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: fromKeypair.publicKey,
    }).add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toPubkey,
        lamports: lamports,
      }),
    );

    // Sign transaction
    transaction.sign(fromKeypair);

    // Send transaction
    const signature = await connection.sendRawTransaction(
      transaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      },
    );

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight,
      },
      'confirmed',
    );

    if (confirmation.value.err) {
      throw new Error(
        `Transaction failed: ${JSON.stringify(confirmation.value.err)}`,
      );
    }

    console.log('Solana transfer successful:', {
      signature,
      from: fromAddress,
      to: toAddress,
      amount: `${amount} SOL`,
    });

    return {
      success: true,
      txHash: signature,
    };
  } catch (error) {
    console.error('Solana transfer error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * XRP Transfer
 * Handles XRP transactions on XRP Ledger network
 */
export const transferXRP = async (
  params: TransferParams,
): Promise<TransferResult> => {
  const { asset, fromAddress, toAddress, amount, privateKey } = params;

  try {
    // TODO: Implement XRP transfer logic
    // 1. Create payment transaction
    // 2. Sign with private key
    // 3. Submit to XRP Ledger
    // 4. Return transaction hash

    console.log('Transferring XRP:', {
      from: fromAddress,
      to: toAddress,
      amount,
      asset: asset.symbol,
    });

    // Placeholder implementation
    throw new Error('XRP transfer not implemented yet');
  } catch (error) {
    console.error('XRP transfer error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Cardano Transfer
 * Handles ADA transactions on Cardano network
 */
export const transferCardano = async (
  params: TransferParams,
): Promise<TransferResult> => {
  const { asset, fromAddress, toAddress, amount, privateKey } = params;

  try {
    // TODO: Implement Cardano transfer logic
    // 1. Build transaction
    // 2. Sign with private key
    // 3. Submit to Cardano network
    // 4. Return transaction hash

    console.log('Transferring Cardano:', {
      from: fromAddress,
      to: toAddress,
      amount,
      asset: asset.symbol,
    });

    // Placeholder implementation
    throw new Error('Cardano transfer not implemented yet');
  } catch (error) {
    console.error('Cardano transfer error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Dogecoin Transfer
 * Handles DOGE transactions on Dogecoin network
 */
export const transferDogecoin = async (
  params: TransferParams,
): Promise<TransferResult> => {
  const { asset, fromAddress, toAddress, amount, privateKey } = params;

  try {
    // TODO: Implement Dogecoin transfer logic
    // 1. Create transaction
    // 2. Sign with private key
    // 3. Broadcast to network
    // 4. Return transaction hash

    console.log('Transferring Dogecoin:', {
      from: fromAddress,
      to: toAddress,
      amount,
      asset: asset.symbol,
    });

    // Placeholder implementation
    throw new Error('Dogecoin transfer not implemented yet');
  } catch (error) {
    console.error('Dogecoin transfer error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Tron Transfer
 * Handles TRX transactions on Tron network
 */
export const transferTron = async (
  params: TransferParams,
): Promise<TransferResult> => {
  const { asset, fromAddress, toAddress, amount, privateKey } = params;

  try {
    // TODO: Implement Tron transfer logic
    // 1. Create transaction
    // 2. Sign with private key
    // 3. Broadcast to Tron network
    // 4. Return transaction ID

    console.log('Transferring Tron:', {
      from: fromAddress,
      to: toAddress,
      amount,
      asset: asset.symbol,
    });

    // Placeholder implementation
    throw new Error('Tron transfer not implemented yet');
  } catch (error) {
    console.error('Tron transfer error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Main transfer function
 * Routes to the appropriate transfer function based on asset network
 */
export const transferAsset = async (
  params: TransferParams,
): Promise<TransferResult> => {
  const { asset } = params;

  // Determine network based on asset ID
  switch (asset.id) {
    case 'bitcoin':
      return transferBitcoin(params);

    case 'ethereum':
      return transferEthereum(params);

    case 'usd_coin_(ethereum)':
      // USDC ERC-20 token contract address (Ethereum mainnet)
      // USDC has 6 decimals
      return transferERC20Token(
        params,
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        6,
      );

    case 'tether_(bsc)':
      // USDT BEP-20 token contract address (BSC mainnet)
      // USDT on BSC has 18 decimals
      return transferBEP20Token(
        params,
        '0x55d398326f99059fF775485246999027B3197955',
        18,
      );

    case 'bnb_smart_chain':
      // BNB on its native BNB Smart Chain (BSC)
      return transferBNB(params);

    case 'solana':
      return transferSolana(params);

    case 'xrp_ledger':
      return transferXRP(params);

    case 'cardano':
      return transferCardano(params);

    case 'dogecoin':
      return transferDogecoin(params);

    case 'tron':
      return transferTron(params);

    default:
      return {
        success: false,
        error: `Unsupported asset: ${asset.name}`,
      };
  }
};

/**
 * Validate transfer parameters
 * Returns true if all parameters are valid
 */
export const validateTransferParams = (
  params: Partial<TransferParams>,
): { valid: boolean; error?: string } => {
  if (!params.asset) {
    return { valid: false, error: 'Asset is required' };
  }

  if (!params.fromAddress || params.fromAddress.trim() === '') {
    return { valid: false, error: 'From address is required' };
  }

  if (!params.toAddress || params.toAddress.trim() === '') {
    return { valid: false, error: 'To address is required' };
  }

  if (!params.amount || params.amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }

  if (params.amount > params.asset.balance) {
    return { valid: false, error: 'Insufficient balance' };
  }

  if (!params.privateKey || params.privateKey.trim() === '') {
    return { valid: false, error: 'Private key is required' };
  }

  return { valid: true };
};

/**
 * Estimate EVM gas fee
 * Fetches current gas price and estimates fee for ETH or ERC-20 transfers
 */
const estimateEVMGasFee = async (
  isERC20: boolean,
): Promise<{ fee: number; gasPrice: bigint; gasLimit: bigint }> => {
  try {
    // Fetch current gas price from Etherscan API (no API key needed for this endpoint)
    const response = await fetch(
      'https://api.etherscan.io/api?module=gastracker&action=gasoracle',
    );

    if (!response.ok) {
      throw new Error('Failed to fetch gas price');
    }

    const data = await response.json();

    if (data.status !== '1' || !data.result) {
      throw new Error('Invalid gas price response');
    }

    // Get proposed gas price in Gwei, convert to Wei
    const gasPriceGwei = parseFloat(
      data.result.ProposeGasPrice || data.result.SafeGasPrice || '20',
    );
    const gasPriceWei = BigInt(Math.ceil(gasPriceGwei * 1e9));

    // Estimate gas limit
    // ETH transfer: ~21,000 gas
    // ERC-20 transfer: ~65,000 gas (more complex)
    const gasLimit = BigInt(isERC20 ? 65000 : 21000);

    // Calculate total fee in Wei
    const feeWei = gasPriceWei * gasLimit;

    // Convert to ETH
    const feeETH = Number(feeWei) / 1e18;

    console.log('[Gas Estimation]', {
      gasPriceGwei,
      gasLimit: gasLimit.toString(),
      feeETH,
      isERC20,
    });

    return { fee: feeETH, gasPrice: gasPriceWei, gasLimit };
  } catch (error) {
    console.error('Error estimating EVM gas fee:', error);
    // Fallback to conservative estimate
    const gasPriceWei = BigInt(30e9); // 30 Gwei
    const gasLimit = BigInt(isERC20 ? 65000 : 21000);
    const feeWei = gasPriceWei * gasLimit;
    const feeETH = Number(feeWei) / 1e18;

    console.log('[Gas Estimation] Using fallback', { feeETH, isERC20 });

    return { fee: feeETH, gasPrice: gasPriceWei, gasLimit };
  }
};

/**
 * Estimate transaction fee
 * Returns estimated fee for the transfer
 */
export const estimateTransferFee = async (
  asset: Asset,
  amount: number,
): Promise<{ fee: number; feeUSD: number }> => {
  let fee: number;

  // Determine if asset is ERC-20, BEP-20, or native token
  const isEthereumNative = asset.id === 'ethereum';
  const isERC20 = ['usd_coin_(ethereum)'].includes(asset.id);
  const isBNBNative = asset.id === 'bnb_smart_chain';
  const isBEP20 = ['tether_(bsc)'].includes(asset.id);

  if (isEthereumNative || isERC20) {
    // Estimate real gas fee for Ethereum network
    const gasEstimate = await estimateEVMGasFee(isERC20);
    fee = gasEstimate.fee;
  } else if (isBNBNative || isBEP20) {
    // Estimate gas fee for BSC network (much cheaper than Ethereum)
    // BSC typically has 3-5 Gwei gas price
    const gasPrice = 5; // 5 Gwei
    const gasPriceInBNB = gasPrice / 1e9; // Convert Gwei to BNB
    const gasLimit = isBEP20 ? 65000 : 21000; // Higher for BEP-20 tokens
    fee = gasPriceInBNB * gasLimit;
  } else {
    // Use static estimates for other networks
    const mockFees: { [key: string]: number } = {
      bitcoin: 0.0001, // BTC
      solana: 0.000005 + 0.00089088, // SOL (tx fee + rent-exempt minimum)
      xrp_ledger: 0.00001, // XRP
      cardano: 0.17, // ADA
      dogecoin: 1.0, // DOGE
      tron: 0.000001, // TRX
    };

    fee = mockFees[asset.id] || 0.001;
  }

  // For ERC-20 tokens, gas is paid in ETH
  // For BEP-20 tokens, gas is paid in BNB
  // We need to get the respective price to calculate USD value
  let feeUSD: number;
  if (isERC20) {
    // Gas fee is in ETH, need to fetch ETH price
    try {
      const ethPriceResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      );
      const ethPriceData = await ethPriceResponse.json();
      const ethPrice = ethPriceData.ethereum?.usd || 3500; // Fallback price
      feeUSD = fee * ethPrice;
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      feeUSD = fee * 3500; // Fallback ETH price
    }
  } else if (isBEP20) {
    // Gas fee is in BNB, need to fetch BNB price
    try {
      const bnbPriceResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd',
      );
      const bnbPriceData = await bnbPriceResponse.json();
      const bnbPrice = bnbPriceData.binancecoin?.usd || 600; // Fallback price
      feeUSD = fee * bnbPrice;
    } catch (error) {
      console.error('Error fetching BNB price:', error);
      feeUSD = fee * 600; // Fallback BNB price
    }
  } else {
    feeUSD = fee * asset.price;
  }

  return { fee, feeUSD };
};
