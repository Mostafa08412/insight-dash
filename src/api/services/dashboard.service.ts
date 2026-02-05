/**
 * Dashboard Service
 * 
 * API service for dashboard-related operations.
 * Supports both mock data and real API calls.
 */

import { API_CONFIG } from '../config';
import { apiClient } from '../client';
import { 
  mockDashboardStats, 
  mockTransactions, 
  salesChartData, 
  categoryDistributionData, 
  topProductsData 
} from '@/mocks';
import type { DashboardStatsResponse, Transaction } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<DashboardStatsResponse> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      return {
        totalProducts: mockDashboardStats.totalProducts,
        totalStockValue: mockDashboardStats.totalStockValue,
        totalSales: mockDashboardStats.totalSales,
        totalPurchases: mockDashboardStats.totalPurchases,
        lowStockCount: mockDashboardStats.lowStockCount,
      };
    }
    return apiClient.get<DashboardStatsResponse>('/dashboard/stats');
  },

  /**
   * Get recent transactions
   */
  getRecentTransactions: async (limit: number = 5): Promise<Transaction[]> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      return mockTransactions.slice(0, limit);
    }
    return apiClient.get<Transaction[]>('/dashboard/recent-transactions', { params: { limit } });
  },

  /**
   * Get sales chart data
   */
  getSalesChartData: async (): Promise<typeof salesChartData> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      return salesChartData;
    }
    return apiClient.get('/dashboard/sales-chart');
  },

  /**
   * Get category distribution data
   */
  getCategoryDistribution: async (): Promise<typeof categoryDistributionData> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      return categoryDistributionData;
    }
    return apiClient.get('/dashboard/category-distribution');
  },

  /**
   * Get top products data
   */
  getTopProducts: async (): Promise<typeof topProductsData> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      return topProductsData;
    }
    return apiClient.get('/dashboard/top-products');
  },
};
