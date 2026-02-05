/**
 * Alerts Service
 * 
 * API service for low stock alert-related operations.
 * Supports both mock data and real API calls.
 */

import { API_CONFIG } from '../config';
import { apiClient } from '../client';
import { mockAlerts, mockProducts } from '@/mocks';
import type { 
  LowStockAlert, 
  PaginatedResponse, 
  GetAlertsParams 
} from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function filterMockAlerts(alerts: LowStockAlert[], params: GetAlertsParams): PaginatedResponse<LowStockAlert> {
  let result = [...alerts];

  // Search filter
  if (params.search) {
    const query = params.search.toLowerCase();
    result = result.filter(a => a.productName.toLowerCase().includes(query));
  }

  // Severity filter
  if (params.severity && params.severity !== 'all') {
    result = result.filter(a => {
      const stockPercentage = (a.currentStock / a.threshold) * 100;
      if (params.severity === 'critical') return stockPercentage < 30;
      if (params.severity === 'low') return stockPercentage >= 30;
      return true;
    });
  }

  // Notification status filter
  if (params.notificationStatus && params.notificationStatus !== 'all') {
    result = result.filter(a => {
      if (params.notificationStatus === 'sent') return a.alertSent;
      if (params.notificationStatus === 'pending') return !a.alertSent;
      return true;
    });
  }

  // Stock range filter
  if (params.stockRange && params.stockRange !== 'all') {
    result = result.filter(a => {
      const stockPercentage = (a.currentStock / a.threshold) * 100;
      switch (params.stockRange) {
        case '0-10': return stockPercentage <= 10;
        case '10-30': return stockPercentage > 10 && stockPercentage <= 30;
        case '30-50': return stockPercentage > 30 && stockPercentage <= 50;
        case '50+': return stockPercentage > 50;
        default: return true;
      }
    });
  }

  // Date range filter
  if (params.dateFrom) {
    result = result.filter(a => new Date(a.date) >= params.dateFrom!);
  }
  if (params.dateTo) {
    result = result.filter(a => new Date(a.date) <= params.dateTo!);
  }

  // Sorting
  if (params.sortBy) {
    result.sort((a, b) => {
      const aPercentage = (a.currentStock / a.threshold) * 100;
      const bPercentage = (b.currentStock / b.threshold) * 100;
      
      let comparison = 0;
      switch (params.sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'stock':
          comparison = aPercentage - bPercentage;
          break;
        case 'name':
          comparison = a.productName.localeCompare(b.productName);
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

export const alertsService = {
  /**
   * Get paginated list of alerts with filtering and sorting
   */
  getList: async (params: GetAlertsParams = {}): Promise<PaginatedResponse<LowStockAlert>> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      return filterMockAlerts(mockAlerts, params);
    }
    return apiClient.get<PaginatedResponse<LowStockAlert>>('/alerts', { params: params as any });
  },

  /**
   * Get a single alert by ID
   */
  getById: async (id: string): Promise<LowStockAlert | undefined> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      return mockAlerts.find(a => a.id === id);
    }
    return apiClient.get<LowStockAlert>(`/alerts/${id}`);
  },

  /**
   * Dismiss an alert
   */
  dismiss: async (id: string): Promise<{ success: boolean }> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      const index = mockAlerts.findIndex(a => a.id === id);
      if (index !== -1) mockAlerts.splice(index, 1);
      return { success: true };
    }
    return apiClient.post<{ success: boolean }>(`/alerts/${id}/dismiss`);
  },

  /**
   * Get alert statistics
   */
  getStats: async (): Promise<{ critical: number; warning: number; healthy: number }> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      const criticalAlerts = mockAlerts.filter(a => (a.currentStock / a.threshold) < 0.3);
      const warningAlerts = mockAlerts.filter(a => (a.currentStock / a.threshold) >= 0.3);
      return {
        critical: criticalAlerts.length,
        warning: warningAlerts.length,
        healthy: mockProducts.length - mockAlerts.length,
      };
    }
    return apiClient.get<{ critical: number; warning: number; healthy: number }>('/alerts/stats');
  },

  /**
   * Mark alert as sent
   */
  markAsSent: async (id: string): Promise<LowStockAlert> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      const alert = mockAlerts.find(a => a.id === id);
      if (!alert) throw new Error('Alert not found');
      alert.alertSent = true;
      return alert;
    }
    return apiClient.post<LowStockAlert>(`/alerts/${id}/mark-sent`);
  },
};
