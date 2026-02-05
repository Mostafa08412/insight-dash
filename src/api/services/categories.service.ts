/**
 * Categories Service
 * 
 * API service for category-related operations.
 * Supports both mock data and real API calls.
 */

import { API_CONFIG } from '../config';
import { apiClient } from '../client';
import { mockCategories, mockProducts } from '@/mocks';
import type { 
  Category, 
  Product,
  PaginatedResponse, 
  GetCategoriesParams, 
  CreateCategoryRequest, 
  UpdateCategoryRequest 
} from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function filterMockCategories(categories: Category[], params: GetCategoriesParams): PaginatedResponse<Category> {
  let result = [...categories];

  // Search filter
  if (params.search) {
    const query = params.search.toLowerCase();
    result = result.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query)
    );
  }

  // Product count filter
  if (params.productCountFilter && params.productCountFilter !== 'all') {
    result = result.filter(c => {
      switch (params.productCountFilter) {
        case '0-20': return c.productCount >= 0 && c.productCount < 20;
        case '20-50': return c.productCount >= 20 && c.productCount < 50;
        case '50-100': return c.productCount >= 50 && c.productCount < 100;
        case '100+': return c.productCount >= 100;
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
        case 'products':
          comparison = a.productCount - b.productCount;
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

export const categoriesService = {
  /**
   * Get paginated list of categories with filtering and sorting
   */
  getList: async (params: GetCategoriesParams = {}): Promise<PaginatedResponse<Category>> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      return filterMockCategories(mockCategories, params);
    }
    return apiClient.get<PaginatedResponse<Category>>('/categories', { params: params as any });
  },

  /**
   * Get all categories (no pagination)
   */
  getAll: async (): Promise<Category[]> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      return [...mockCategories];
    }
    return apiClient.get<Category[]>('/categories/all');
  },

  /**
   * Get a single category by ID
   */
  getById: async (id: string): Promise<Category | undefined> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      return mockCategories.find(c => c.id === id);
    }
    return apiClient.get<Category>(`/categories/${id}`);
  },

  /**
   * Get products in a category
   */
  getProducts: async (categoryId: string): Promise<Product[]> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      return mockProducts.filter(p => p.categoryId === categoryId);
    }
    return apiClient.get<Product[]>(`/categories/${categoryId}/products`);
  },

  /**
   * Create a new category
   */
  create: async (data: CreateCategoryRequest): Promise<Category> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      const newCategory: Category = {
        ...data,
        id: String(Date.now()),
        productCount: 0,
      };
      mockCategories.push(newCategory);
      return newCategory;
    }
    return apiClient.post<Category>('/categories', data);
  },

  /**
   * Update an existing category
   */
  update: async (data: UpdateCategoryRequest): Promise<Category> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      const index = mockCategories.findIndex(c => c.id === data.id);
      if (index === -1) throw new Error('Category not found');
      
      const updated: Category = {
        ...mockCategories[index],
        ...data,
      };
      mockCategories[index] = updated;
      return updated;
    }
    return apiClient.put<Category>(`/categories/${data.id}`, data);
  },

  /**
   * Delete a category
   */
  delete: async (id: string): Promise<{ success: boolean }> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      const index = mockCategories.findIndex(c => c.id === id);
      if (index !== -1) mockCategories.splice(index, 1);
      return { success: true };
    }
    return apiClient.delete<{ success: boolean }>(`/categories/${id}`);
  },
};
