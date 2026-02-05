/**
 * Products Service
 * 
 * API service for product-related operations.
 * Supports both mock data and real API calls.
 */

import { API_CONFIG } from '../config';
import { apiClient } from '../client';
import { mockProducts, mockCategories } from '@/mocks';
import type { 
  Product, 
  PaginatedResponse, 
  GetProductsParams, 
  CreateProductRequest, 
  UpdateProductRequest 
} from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to filter and paginate mock data
function filterMockProducts(products: Product[], params: GetProductsParams): PaginatedResponse<Product> {
  let result = [...products];

  // Search filter
  if (params.search) {
    const query = params.search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.supplier.toLowerCase().includes(query)
    );
  }

  // Category filter
  if (params.categoryId && params.categoryId !== 'all') {
    result = result.filter(p => p.categoryId === params.categoryId);
  }

  // Stock filter
  if (params.stockFilter && params.stockFilter !== 'all') {
    result = result.filter(p => {
      const ratio = p.quantityInStock / p.lowStockThreshold;
      switch (params.stockFilter) {
        case 'critical': return ratio <= 0.3;
        case 'low': return ratio > 0.3 && ratio <= 1;
        case 'in-stock': return ratio > 1;
        default: return true;
      }
    });
  }

  // Supplier filter
  if (params.supplier && params.supplier !== 'all') {
    result = result.filter(p => p.supplier === params.supplier);
  }

  // Price range filter
  if (params.priceRange && params.priceRange !== 'all') {
    result = result.filter(p => {
      switch (params.priceRange) {
        case '0-100': return p.price >= 0 && p.price < 100;
        case '100-500': return p.price >= 100 && p.price < 500;
        case '500-1000': return p.price >= 500 && p.price < 1000;
        case '1000+': return p.price >= 1000;
        default: return true;
      }
    });
  }

  // Sorting
  if (params.sortBy) {
    result.sort((a, b) => {
      let comparison = 0;
      switch (params.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'sku':
          comparison = a.sku.localeCompare(b.sku);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'stock':
          comparison = a.quantityInStock - b.quantityInStock;
          break;
      }
      return params.sortOrder === 'desc' ? -comparison : comparison;
    });
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

export const productsService = {
  /**
   * Get paginated list of products with filtering and sorting
   */
  getList: async (params: GetProductsParams = {}): Promise<PaginatedResponse<Product>> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      return filterMockProducts(mockProducts, params);
    }
    return apiClient.get<PaginatedResponse<Product>>('/products', { params: params as any });
  },

  /**
   * Get a single product by ID
   */
  getById: async (id: string): Promise<Product | undefined> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      return mockProducts.find(p => p.id === id);
    }
    return apiClient.get<Product>(`/products/${id}`);
  },

  /**
   * Create a new product
   */
  create: async (data: CreateProductRequest): Promise<Product> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      const newProduct: Product = {
        ...data,
        id: String(Date.now()),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockProducts.unshift(newProduct);
      return newProduct;
    }
    return apiClient.post<Product>('/products', data);
  },

  /**
   * Update an existing product
   */
  update: async (data: UpdateProductRequest): Promise<Product> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      const index = mockProducts.findIndex(p => p.id === data.id);
      if (index === -1) throw new Error('Product not found');
      
      const updated: Product = {
        ...mockProducts[index],
        ...data,
        updatedAt: new Date(),
      };
      mockProducts[index] = updated;
      return updated;
    }
    return apiClient.put<Product>(`/products/${data.id}`, data);
  },

  /**
   * Delete a product
   */
  delete: async (id: string): Promise<{ success: boolean }> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      const index = mockProducts.findIndex(p => p.id === id);
      if (index !== -1) mockProducts.splice(index, 1);
      return { success: true };
    }
    return apiClient.delete<{ success: boolean }>(`/products/${id}`);
  },

  /**
   * Get unique suppliers from products
   */
  getSuppliers: async (): Promise<string[]> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      return [...new Set(mockProducts.map(p => p.supplier))];
    }
    return apiClient.get<string[]>('/products/suppliers');
  },

  /**
   * Get category name by ID
   */
  getCategoryName: (categoryId: string): string => {
    return mockCategories.find(c => c.id === categoryId)?.name || 'Unknown';
  },
};
