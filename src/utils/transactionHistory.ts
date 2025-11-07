import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/apiService';

export type TransactionHistoryItem = {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  symbol: string;
  date: string;
  txHash: string;
  toAddress?: string;
  fromAddress?: string;
  network: string;
  status: 'pending' | 'confirmed' | 'failed';
  category?: 'invoice' | 'topup' | 'withdraw' | 'transfer';
  // Invoice-specific fields
  invoiceId?: string;
  invoiceDescription?: string;
  invoicePaymentStatus?: boolean;
  metadata?: string; // For additional invoice data
};

const TRANSACTION_HISTORY_KEY = 'transaction_history';
const WALLET_ID_KEY = 'wallet_id';

/**
 * Save wallet ID for API calls
 */
export const saveWalletId = async (
  address: string,
  walletType: 'main' | 'tap-to-pay',
): Promise<string | null> => {
  try {
    // Register wallet with backend
    const { wallet } = await apiService.createOrGetWallet(address, walletType);
    await AsyncStorage.setItem(`${WALLET_ID_KEY}_${address}`, wallet.id);
    console.log(`✅ Wallet registered with backend: ${wallet.id}`);
    return wallet.id;
  } catch (error) {
    console.warn(
      '⚠️ Failed to register wallet with backend (app will work offline):',
      error,
    );
    // Don't throw - allow app to work without backend
    return null;
  }
};

/**
 * Get wallet ID from storage
 */
export const getWalletId = async (address: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(`${WALLET_ID_KEY}_${address}`);
  } catch (error) {
    console.error('Error getting wallet ID:', error);
    return null;
  }
};

/**
 * Save a new transaction to history (local + backend)
 */
export const saveTransaction = async (
  transaction: Omit<TransactionHistoryItem, 'id' | 'date' | 'status'>,
  walletAddress: string,
): Promise<void> => {
  try {
    // Get wallet ID
    let walletId = await getWalletId(walletAddress);
    if (!walletId) {
      walletId = await saveWalletId(
        walletAddress,
        transaction.network.toLowerCase().includes('tap')
          ? 'tap-to-pay'
          : 'main',
      );
    }

    // Save to backend (only if walletId exists)
    if (walletId) {
      try {
        await apiService.createTransaction({
          walletId,
          txHash: transaction.txHash,
          txType: transaction.type,
          asset: transaction.symbol,
          amount: transaction.amount,
          toAddress: transaction.toAddress || '',
          fromAddress: transaction.fromAddress || '',
          status: 'pending',
        });
        console.log('✅ Transaction synced to backend');
      } catch (apiError) {
        console.warn(
          '⚠️ Failed to sync to backend, saved locally only:',
          apiError,
        );
      }
    } else {
      console.log('ℹ️ Working offline - transaction saved locally only');
    }

    // Save to local storage
    const history = await getTransactionHistory();

    const newTransaction: TransactionHistoryItem = {
      ...transaction,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
      status: 'pending',
    };

    history.unshift(newTransaction);

    // Keep only last 100 transactions
    const trimmedHistory = history.slice(0, 100);

    await AsyncStorage.setItem(
      TRANSACTION_HISTORY_KEY,
      JSON.stringify(trimmedHistory),
    );

    console.log('Transaction saved to history:', newTransaction.id);
  } catch (error) {
    console.error('Error saving transaction:', error);
  }
};

/**
 * Get all transaction history (local + sync from backend)
 */
export const getTransactionHistory = async (
  walletAddress?: string,
): Promise<TransactionHistoryItem[]> => {
  try {
    // Get local history
    const data = await AsyncStorage.getItem(TRANSACTION_HISTORY_KEY);
    const localHistory: TransactionHistoryItem[] = data ? JSON.parse(data) : [];

    // Try to sync from backend if wallet address is provided
    if (walletAddress) {
      try {
        const { transactions } = await apiService.getTransactionsByAddress(
          walletAddress,
          50,
          0,
        );

        // Merge backend transactions with local
        const backendHistory: TransactionHistoryItem[] = transactions.map(
          tx => ({
            id: tx.id,
            type: tx.tx_type,
            amount: parseFloat(tx.amount),
            symbol: tx.asset,
            date: tx.timestamp,
            txHash: tx.tx_hash,
            toAddress: tx.to_address,
            fromAddress: tx.from_address,
            network: 'Solana', // You might want to store this in DB
            status: tx.status,
          }),
        );

        // Merge and deduplicate by txHash
        const merged = [...backendHistory, ...localHistory];
        const unique = merged.filter(
          (tx, index, self) =>
            index === self.findIndex(t => t.txHash === tx.txHash),
        );

        return unique.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
      } catch (apiError) {
        console.warn(
          'Failed to sync from backend, using local only:',
          apiError,
        );
      }
    }

    return localHistory;
  } catch (error) {
    console.error('Error getting transaction history:', error);
    return [];
  }
};

/**
 * Get transaction history for a specific asset
 */
export const getAssetTransactionHistory = async (
  symbol: string,
): Promise<TransactionHistoryItem[]> => {
  try {
    const allHistory = await getTransactionHistory();
    return allHistory.filter(tx => tx.symbol === symbol);
  } catch (error) {
    console.error('Error getting asset transaction history:', error);
    return [];
  }
};

/**
 * Update transaction status (local + backend)
 */
export const updateTransactionStatus = async (
  txHash: string,
  status: 'pending' | 'confirmed' | 'failed',
  blockNumber?: number,
): Promise<void> => {
  try {
    // Update in backend
    try {
      await apiService.updateTransactionStatus(txHash, status, blockNumber);
    } catch (apiError) {
      console.warn('Failed to update status in backend:', apiError);
    }

    // Update local storage
    const history = await getTransactionHistory();
    const updatedHistory = history.map(tx =>
      tx.txHash === txHash ? { ...tx, status } : tx,
    );

    await AsyncStorage.setItem(
      TRANSACTION_HISTORY_KEY,
      JSON.stringify(updatedHistory),
    );

    console.log(`Transaction ${txHash} status updated to ${status}`);
  } catch (error) {
    console.error('Error updating transaction status:', error);
  }
};

/**
 * Clear all transaction history
 */
export const clearTransactionHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TRANSACTION_HISTORY_KEY);
    console.log('Transaction history cleared');
  } catch (error) {
    console.error('Error clearing transaction history:', error);
  }
};

/**
 * Fetch invoices from backend and convert to transaction history items
 */
export const fetchInvoicesAsTransactions = async (
  address: string,
  walletType: 'payee' | 'payer' = 'payer',
): Promise<TransactionHistoryItem[]> => {
  try {
    console.log(`[Invoices] Fetching ${walletType} invoices for ${address}`);

    let invoices;
    if (walletType === 'payee') {
      const result = await apiService.getInvoicesByPayee(address);
      invoices = result.invoices;
    } else {
      const result = await apiService.getInvoicesByPayer(address);
      invoices = result.invoices;
    }

    console.log(`[Invoices] Found ${invoices.length} ${walletType} invoices`);

    // Convert invoices to transaction history items
    const transactions: TransactionHistoryItem[] = invoices.map(invoice => ({
      id: `invoice-${invoice.id}`,
      type: walletType === 'payee' ? 'receive' : 'send',
      amount: parseFloat(invoice.amount),
      symbol: invoice.asset || 'USDC',
      date: invoice.created_at,
      txHash: `invoice-${invoice.id}`, // Temporary until actual payment
      toAddress: invoice.payee,
      fromAddress: invoice.payer || 'Pending',
      network: 'Solana',
      status: invoice.payment_status ? 'confirmed' : 'pending',
      category: 'invoice',
      invoiceId: invoice.id,
      invoiceDescription: invoice.description,
      invoicePaymentStatus: invoice.payment_status,
      metadata: JSON.stringify({
        walletType,
        createdAt: invoice.created_at,
      }),
    }));

    return transactions;
  } catch (error) {
    console.error(`[Invoices] Error fetching ${walletType} invoices:`, error);
    return [];
  }
};

/**
 * Get combined transaction history including invoices
 */
export const getTransactionHistoryWithInvoices = async (
  address: string,
): Promise<TransactionHistoryItem[]> => {
  try {
    // Get regular transactions
    const regularTxs = await getTransactionHistory(address);

    // Get invoices as payee (receiving)
    const payeeInvoices = await fetchInvoicesAsTransactions(address, 'payee');

    // Get invoices as payer (sending)
    const payerInvoices = await fetchInvoicesAsTransactions(address, 'payer');

    // Remove duplicates: if user paid their own invoice, only show as payee (creator)
    // This prevents duplicate keys when the same invoice appears in both lists
    const uniquePayerInvoices = payerInvoices.filter(
      payerInvoice =>
        !payeeInvoices.some(
          payeeInvoice => payeeInvoice.invoiceId === payerInvoice.invoiceId,
        ),
    );

    // Combine and sort by date (newest first)
    const combined = [...regularTxs, ...payeeInvoices, ...uniquePayerInvoices];
    combined.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    console.log(
      `[Invoices] Combined history: ${regularTxs.length} txs + ${
        payeeInvoices.length
      } payee invoices + ${uniquePayerInvoices.length} payer invoices (${
        payerInvoices.length - uniquePayerInvoices.length
      } duplicates removed) = ${combined.length} total`,
    );

    return combined;
  } catch (error) {
    console.error('[Invoices] Error getting combined history:', error);
    // Fallback to regular transactions
    return await getTransactionHistory(address);
  }
};

/**
 * Monitor invoice status changes and update transaction history
 */
export const monitorInvoiceStatus = async (
  invoiceId: string,
  address: string,
): Promise<void> => {
  try {
    const result = await apiService.getInvoice(invoiceId);
    const invoice = result.invoice;

    console.log(
      `[Invoices] Monitoring invoice ${invoiceId}: paid=${invoice.payment_status}`,
    );

    // If invoice is paid, we can update the local history
    if (invoice.payment_status) {
      const history = await getTransactionHistory(address);
      const updated = history.map(tx => {
        if (tx.invoiceId === invoiceId) {
          return {
            ...tx,
            status: 'confirmed' as const,
            invoicePaymentStatus: true,
          };
        }
        return tx;
      });

      await AsyncStorage.setItem(
        TRANSACTION_HISTORY_KEY,
        JSON.stringify(updated),
      );

      console.log(`[Invoices] Updated invoice ${invoiceId} status to paid`);
    }
  } catch (error) {
    console.error(`[Invoices] Error monitoring invoice ${invoiceId}:`, error);
  }
};
