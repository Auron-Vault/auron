import { API_URL } from '@env';

export interface Wallet {
  id: string;
  public_address: string;
  wallet_type: 'main' | 'tap-to-pay';
  created_at: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  tx_hash: string;
  tx_type: 'send' | 'receive';
  asset: string;
  amount: string;
  to_address: string;
  from_address: string;
  status: 'pending' | 'confirmed' | 'failed';
  block_number?: number;
  timestamp: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  payee: string;
  payer: string | null;
  amount: string;
  description: string;
  asset: string;
  payment_status: boolean;
  created_at: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL || 'http://185.250.38.132:3000';
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }

  // Wallet endpoints
  async createOrGetWallet(
    publicAddress: string,
    walletType: 'main' | 'tap-to-pay',
  ): Promise<{ wallet: Wallet; created: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/wallets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicAddress,
          walletType,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create/get wallet: ${response.status} ${response.statusText}. ${errorText}`,
        );
      }

      return response.json();
    } catch (error: any) {
      console.error('API Error:', error);
      throw new Error(
        `Network error: ${error.message || 'Cannot reach server'}`,
      );
    }
  }

  async getWalletByAddress(address: string): Promise<{ wallet: Wallet }> {
    const response = await fetch(`${this.baseUrl}/api/wallets/${address}`);

    if (!response.ok) {
      throw new Error(`Failed to get wallet: ${response.statusText}`);
    }

    return response.json();
  }

  // Transaction endpoints
  async createTransaction(transaction: {
    walletId: string;
    txHash: string;
    txType: 'send' | 'receive';
    asset: string;
    amount: number;
    toAddress: string;
    fromAddress: string;
    status?: 'pending' | 'confirmed' | 'failed';
    blockNumber?: number;
    timestamp?: Date;
  }): Promise<{ transaction: Transaction }> {
    const response = await fetch(`${this.baseUrl}/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create transaction');
    }

    return response.json();
  }

  async getTransactionsByWalletId(
    walletId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ transactions: Transaction[]; count: number }> {
    const response = await fetch(
      `${this.baseUrl}/api/transactions/wallet/${walletId}?limit=${limit}&offset=${offset}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to get transactions: ${response.statusText}`);
    }

    return response.json();
  }

  async getTransactionsByAddress(
    address: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ transactions: Transaction[]; count: number }> {
    const response = await fetch(
      `${this.baseUrl}/api/transactions/address/${address}?limit=${limit}&offset=${offset}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to get transactions: ${response.statusText}`);
    }

    return response.json();
  }

  async updateTransactionStatus(
    txHash: string,
    status: 'pending' | 'confirmed' | 'failed',
    blockNumber?: number,
  ): Promise<{ transaction: Transaction }> {
    const response = await fetch(`${this.baseUrl}/api/transactions/${txHash}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        blockNumber,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update transaction: ${response.statusText}`);
    }

    return response.json();
  }

  // Invoice endpoints
  async createInvoice(
    payee: string,
    amount: string,
    description?: string,
    payer?: string,
    asset: string = 'USDC',
  ): Promise<{ invoice: Invoice }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payee,
          payer: payer || null,
          amount,
          description: description || 'Basic Payment',
          asset,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create invoice: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  async getInvoice(invoiceId: string): Promise<{ invoice: Invoice }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/invoices/${invoiceId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch invoice: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  async getInvoicesByPayee(
    payeeAddress: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ invoices: Invoice[]; count: number }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/invoices/payee/${payeeAddress}?limit=${limit}&offset=${offset}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch invoices: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  async getInvoicesByPayer(
    payerAddress: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ invoices: Invoice[]; count: number }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/invoices/payer/${payerAddress}?limit=${limit}&offset=${offset}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch invoices: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  async markInvoicePaid(
    invoiceId: string,
    txHash: string,
    payerAddress?: string,
  ): Promise<{ invoice: Invoice; txHash: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/invoices/${invoiceId}/pay`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            txHash,
            payerAddress,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to mark invoice as paid: ${response.statusText}`,
        );
      }

      return response.json();
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      throw error;
    }
  }
}

export default new ApiService();
