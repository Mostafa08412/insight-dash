/**
 * API Types
 * 
 * Centralized type definitions for API requests and responses.
 */

// Re-export domain types
export * from '@/types/inventory';

// ============================================
// Common API Types
// ============================================

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRangeParams {
  dateFrom?: Date;
  dateTo?: Date;
}

// ============================================
// Product API Types
// ============================================

export interface GetProductsParams extends PaginationParams, SortParams {
  search?: string;
  categoryId?: string;
  stockFilter?: 'all' | 'in-stock' | 'low' | 'critical';
  supplier?: string;
  priceRange?: 'all' | '0-100' | '100-500' | '500-1000' | '1000+';
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  description: string;
  price: number;
  quantityInStock: number;
  categoryId: string;
  supplier: string;
  lowStockThreshold: number;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

// ============================================
// Category API Types
// ============================================

export interface GetCategoriesParams extends PaginationParams, SortParams {
  search?: string;
  productCountFilter?: 'all' | '0-20' | '20-50' | '50-100' | '100+';
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: string;
}

// ============================================
// Transaction API Types
// ============================================

export interface GetTransactionsParams extends PaginationParams, SortParams, DateRangeParams {
  search?: string;
  type?: 'all' | 'sale' | 'purchase';
  userId?: string;
  amountRange?: 'all' | '0-100' | '100-500' | '500-1000' | '1000+';
}

export interface CreateTransactionRequest {
  productId: string;
  quantity: number;
  type: 'sale' | 'purchase';
}

// ============================================
// Alert API Types
// ============================================

export interface GetAlertsParams extends PaginationParams, SortParams, DateRangeParams {
  search?: string;
  severity?: 'all' | 'critical' | 'low';
  notificationStatus?: 'all' | 'sent' | 'pending';
  stockRange?: 'all' | '0-10' | '10-30' | '30-50' | '50+';
}

export interface DismissAlertRequest {
  alertId: string;
}

// ============================================
// User API Types
// ============================================

export interface GetUsersParams extends PaginationParams, SortParams {
  search?: string;
  role?: 'all' | 'admin' | 'manager' | 'staff';
  status?: 'all' | 'active' | 'inactive';
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: string;
  status?: 'active' | 'inactive';
}

// ============================================
// Dashboard API Types
// ============================================

export interface DashboardStatsResponse {
  totalProducts: number;
  totalStockValue: number;
  totalSales: number;
  totalPurchases: number;
  lowStockCount: number;
}

// ============================================
// Reports API Types
// ============================================

export interface ReportParams extends DateRangeParams {
  type: 'revenue' | 'expenses' | 'profit' | 'inventory';
  groupBy?: 'day' | 'week' | 'month' | 'year';
}

export interface ReportDataPoint {
  label: string;
  value: number;
}

export interface ReportResponse {
  data: ReportDataPoint[];
  summary: {
    total: number;
    average: number;
    min: number;
    max: number;
  };
}
