import AsyncStorage from '@react-native-async-storage/async-storage';

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
};

const TRANSACTION_HISTORY_KEY = 'transaction_history';

/**
 * Save a new transaction to history
 */
export const saveTransaction = async (
  transaction: Omit<TransactionHistoryItem, 'id' | 'date' | 'status'>,
): Promise<void> => {
  try {
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
 * Get all transaction history
 */
export const getTransactionHistory = async (): Promise<
  TransactionHistoryItem[]
> => {
  try {
    const data = await AsyncStorage.getItem(TRANSACTION_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
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
 * Update transaction status
 */
export const updateTransactionStatus = async (
  txId: string,
  status: 'pending' | 'confirmed' | 'failed',
): Promise<void> => {
  try {
    const history = await getTransactionHistory();
    const updatedHistory = history.map(tx =>
      tx.id === txId ? { ...tx, status } : tx,
    );

    await AsyncStorage.setItem(
      TRANSACTION_HISTORY_KEY,
      JSON.stringify(updatedHistory),
    );

    console.log(`Transaction ${txId} status updated to ${status}`);
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
