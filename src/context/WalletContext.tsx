import React, { createContext, useState, useContext, ReactNode } from 'react';

// 1. Define the shape of the context's value
interface IWalletContext {
  tagId: string | null;
  setTagId: (id: string | null) => void;
  evmAddress: string | null;
  setEvmAddress: (address: string | null) => void;
  solanaAddress: string | null;
  setSolanaAddress: (address: string | null) => void;
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
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const [solanaAddress, setSolanaAddress] = useState<string | null>(null);

  // The complete value object to be passed to the provider
  const value = {
    tagId,
    setTagId,
    evmAddress,
    setEvmAddress,
    solanaAddress,
    setSolanaAddress,
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
