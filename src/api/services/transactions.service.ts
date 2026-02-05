/**
 * Transactions Service
 * 
 * API service for transaction-related operations.
 * Supports both mock data and real API calls.
 */

import { API_CONFIG } from '../config';
import { apiClient } from '../client';
import { mockTransactions } from '@/mocks';
import type { 
  Transaction, 
  PaginatedResponse, 
  GetTransactionsParams, 
  CreateTransactionRequest 
} from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function filterMockTransactions(transactions: Transaction[], params: GetTransactionsParams): PaginatedResponse<Transaction> {
  let result = [...transactions];

  // Search filter
  if (params.search) {
    const query = params.search.toLowerCase();
    result = result.filter(t =>
      t.productName.toLowerCase().includes(query) ||
      t.userName.toLowerCase().includes(query)
    );
  }

  // Type filter
  if (params.type && params.type !== 'all') {
    result = result.filter(t => t.type === params.type);
  }

  // User filter
  if (params.userId && params.userId !== 'all') {
    result = result.filter(t => t.userName === params.userId);
  }

  // Date range filter
  if (params.dateFrom) {
    result = result.filter(t => new Date(t.date) >= params.dateFrom!);
  }
  if (params.dateTo) {
    const endDate = new Date(params.dateTo);
    endDate.setHours(23, 59, 59, 999);
    result = result.filter(t => new Date(t.date) <= endDate);
  }

  // Amount range filter
  if (params.amountRange && params.amountRange !== 'all') {
    result = result.filter(t => {
      switch (params.amountRange) {
        case '0-100': return t.totalAmount >= 0 && t.totalAmount < 100;
        case '100-500': return t.totalAmount >= 100 && t.totalAmount < 500;
        case '500-1000': return t.totalAmount >= 500 && t.totalAmount < 1000;
        case '1000+': return t.totalAmount >= 1000;
        default: return true;
      }
    });
  }

  // Sorting
  if (params.sortBy) {
    result.sort((a, b) => {
      let comparison = 0;
      switch (params.sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.totalAmount - b.totalAmount;
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
      }
      return params.sortOrder === 'desc' ? -comparison : comparison;
    });
  } else {
    // Default sort by date desc
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Pagination
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const totalCount = result.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (page - 1) * pageSize;
  const items = result.slice(startIndex, startIndex + pageSize);

  return {
    items,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}

export const transactionsService = {
  /**
   * Get paginated list of transactions with filtering and sorting
   */
  getList: async (params: GetTransactionsParams = {}): Promise<PaginatedResponse<Transaction>> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      return filterMockTransactions(mockTransactions, params);
    }
    return apiClient.get<PaginatedResponse<Transaction>>('/transactions', { params: params as any });
  },

  /**
   * Get a single transaction by ID
   */
  getById: async (id: string): Promise<Transaction | undefined> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      return mockTransactions.find(t => t.id === id);
    }
    return apiClient.get<Transaction>(`/transactions/${id}`);
  },

  /**
   * Get transactions for a specific product
   */
  getByProduct: async (productId: string): Promise<Transaction[]> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      return mockTransactions.filter(t => t.productId === productId);
    }
    return apiClient.get<Transaction[]>(`/products/${productId}/transactions`);
  },

  /**
   * Create a new transaction
   */
  create: async (data: CreateTransactionRequest): Promise<Transaction> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      const product = mockTransactions.find(t => t.productId === data.productId);
      const newTransaction: Transaction = {
        id: String(Date.now()),
        productId: data.productId,
        productName: product?.productName || 'Unknown Product',
        quantity: data.quantity,
        type: data.type,
        date: new Date(),
        userId: '1',
        userName: 'Current User',
        totalAmount: data.quantity * 100,
      };
      mockTransactions.unshift(newTransaction);
      return newTransaction;
    }
    return apiClient.post<Transaction>('/transactions', data);
  },

  /**
   * Get unique users from transactions
   */
  getUsers: async (): Promise<string[]> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      return [...new Set(mockTransactions.map(t => t.userName))];
    }
    return apiClient.get<string[]>('/transactions/users');
  },

  /**
   * Get recent transactions
   */
  getRecent: async (limit: number = 5): Promise<Transaction[]> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      return mockTransactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
    }
    return apiClient.get<Transaction[]>('/transactions/recent', { params: { limit } });
  },
};
