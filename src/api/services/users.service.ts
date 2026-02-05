/**
 * Users Service
 * 
 * API service for user-related operations.
 * Supports both mock data and real API calls.
 */

import { API_CONFIG } from '../config';
import { apiClient } from '../client';
import { mockUsers } from '@/mocks';
import type { 
  User, 
  PaginatedResponse, 
  GetUsersParams, 
  CreateUserRequest, 
  UpdateUserRequest 
} from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function filterMockUsers(users: User[], params: GetUsersParams): PaginatedResponse<User> {
  let result = [...users];

  // Search filter
  if (params.search) {
    const query = params.search.toLowerCase();
    result = result.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    );
  }

  // Role filter
  if (params.role && params.role !== 'all') {
    result = result.filter(u => u.role === params.role);
  }

  // Status filter
  if (params.status && params.status !== 'all') {
    result = result.filter(u => u.status === params.status);
  }

  // Sorting
  if (params.sortBy) {
    result.sort((a, b) => {
      let comparison = 0;
      switch (params.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'role':
          comparison = a.role.localeCompare(b.role);
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

export const usersService = {
  /**
   * Get paginated list of users with filtering and sorting
   */
  getList: async (params: GetUsersParams = {}): Promise<PaginatedResponse<User>> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      return filterMockUsers(mockUsers, params);
    }
    return apiClient.get<PaginatedResponse<User>>('/users', { params: params as any });
  },

  /**
   * Get all users (no pagination)
   */
  getAll: async (): Promise<User[]> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      return [...mockUsers];
    }
    return apiClient.get<User[]>('/users/all');
  },

  /**
   * Get a single user by ID
   */
  getById: async (id: string): Promise<User | undefined> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      return mockUsers.find(u => u.id === id);
    }
    return apiClient.get<User>(`/users/${id}`);
  },

  /**
   * Create a new user
   */
  create: async (data: CreateUserRequest): Promise<User> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      const initials = data.name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      const newUser: User = {
        ...data,
        id: String(Date.now()),
        status: 'active',
        avatar: initials,
        createdAt: new Date(),
      };
      mockUsers.push(newUser);
      return newUser;
    }
    return apiClient.post<User>('/users', data);
  },

  /**
   * Update an existing user
   */
  update: async (data: UpdateUserRequest): Promise<User> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      const index = mockUsers.findIndex(u => u.id === data.id);
      if (index === -1) throw new Error('User not found');
      
      const updated: User = {
        ...mockUsers[index],
        ...data,
      };
      mockUsers[index] = updated;
      return updated;
    }
    return apiClient.put<User>(`/users/${data.id}`, data);
  },

  /**
   * Delete a user
   */
  delete: async (id: string): Promise<{ success: boolean }> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      const index = mockUsers.findIndex(u => u.id === id);
      if (index !== -1) mockUsers.splice(index, 1);
      return { success: true };
    }
    return apiClient.delete<{ success: boolean }>(`/users/${id}`);
  },

  /**
   * Get user by role
   */
  getByRole: async (role: 'admin' | 'manager' | 'staff'): Promise<User | undefined> => {
    if (API_CONFIG.useMockData) {
      await delay(API_CONFIG.mockDelay);
      return mockUsers.find(u => u.role === role);
    }
    return apiClient.get<User>(`/users/role/${role}`);
  },
};
