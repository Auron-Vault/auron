import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ImageSourcePropType } from 'react-native';

// Asset interface
export interface Asset {
  id: string;
  name: string;
  symbol: string;
  logo: ImageSourcePropType;
  price: number;
  balance: number;
  value: number;
  priceChangePercentage?: number; // Price change since last update
}

// Wallet addresses interface
export interface WalletAddresses {
  bitcoin: string | null;
  ethereum: string | null;
  bsc: string | null;
  solana: string | null;
}

// Private keys interface (kept separate from addresses for security)
export interface WalletPrivateKeys {
  bitcoin: string | null;
  ethereum: string | null;
  bsc: string | null;
  solana: string | null;
}

// 1. Define the shape of the context's value
interface IWalletContext {
  tagId: string | null;
  setTagId: (id: string | null) => void;
  pin: string | null;
  setPin: (pin: string | null) => void;
  addresses: WalletAddresses;
  setAddresses: (addresses: WalletAddresses) => void;
  privateKeys: WalletPrivateKeys;
  setPrivateKeys: (keys: WalletPrivateKeys) => void;
  assets: Asset[];
  setAssets: (assets: Asset[] | ((prev: Asset[]) => Asset[])) => void;
  totalValue: number;
  // Tap-to-Pay wallet state
  tapToPayAddress: string | null;
  setTapToPayAddress: (address: string | null) => void;
  tapToPayInitialized: boolean;
  setTapToPayInitialized: (initialized: boolean) => void;
}

// 2. Create the context with a default value
const WalletContext = createContext<IWalletContext | undefined>(undefined);

// 3. Define the props for the Provider component
interface WalletProviderProps {
  children: ReactNode;
}

// 4. Create the Provider component
export function WalletProvider({ children }: WalletProviderProps) {
  const [tagId, setTagId] = useState<string | null>(null);
  const [pin, setPin] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<WalletAddresses>({
    bitcoin: null,
    ethereum: null,
    bsc: null,
    solana: null,
  });
  const [privateKeys, setPrivateKeys] = useState<WalletPrivateKeys>({
    bitcoin: null,
    ethereum: null,
    bsc: null,
    solana: null,
  });
  const [assets, setAssets] = useState<Asset[]>([]);

  // Tap-to-Pay wallet state
  const [tapToPayAddress, setTapToPayAddress] = useState<string | null>(null);
  const [tapToPayInitialized, setTapToPayInitialized] = useState(false);

  // Calculate total value from assets
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  // The complete value object to be passed to the provider
  const value = {
    tagId,
    setTagId,
    pin,
    setPin,
    addresses,
    setAddresses,
    privateKeys,
    setPrivateKeys,
    assets,
    setAssets,
    totalValue,
    tapToPayAddress,
    setTapToPayAddress,
    tapToPayInitialized,
    setTapToPayInitialized,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

// 5. Create a custom hook for easy access
export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
