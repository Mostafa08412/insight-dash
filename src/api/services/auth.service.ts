/**
 * Authentication Service
 * Handles all auth-related API calls
 */

import { API_CONFIG } from '../config';
import {
  LoginRequest,
  RegisterCommand,
  ChangePasswordCommand,
  RefreshTokenCommand,
  AuthenticationResponseApiResponse,
  ApiResponse,
  AuthenticationResponse,
  IdentityUserDto,
} from '../types/auth.types';

const AUTH_ENDPOINTS = {
  login: '/auth/login',
  register: '/auth/register',
  changePassword: '/auth/change-password',
  logout: '/auth/logout',
  refreshToken: '/auth/refresh-token',
};

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'auth_user';

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    const token = this.getAccessToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();
    return data;
  }

  // Token Management
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  getStoredUser(): IdentityUserDto | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  private saveTokens(response: AuthenticationResponse): void {
    if (response.accessToken?.token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken.token);
    }
    if (response.refreshToken?.token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken.token);
    }
    if (response.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }
  }

  private clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Auth API Methods
  async login(credentials: LoginRequest): Promise<AuthenticationResponseApiResponse> {
    const response = await this.request<AuthenticationResponseApiResponse>(
      AUTH_ENDPOINTS.login,
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );

    if (response.isSuccess && response.data) {
      this.saveTokens(response.data);
    }

    return response;
  }

  async register(data: RegisterCommand): Promise<ApiResponse<void>> {
    const response = await this.request<ApiResponse<void>>(
      AUTH_ENDPOINTS.register,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    return response;
  }

  async changePassword(data: ChangePasswordCommand): Promise<ApiResponse<void>> {
    const response = await this.request<ApiResponse<void>>(
      AUTH_ENDPOINTS.changePassword,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request<ApiResponse<void>>(AUTH_ENDPOINTS.logout, {
        method: 'POST',
        body: JSON.stringify({}),
      });
    } finally {
      this.clearTokens();
    }
  }

  async refreshToken(): Promise<AuthenticationResponseApiResponse | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    const data: RefreshTokenCommand = { refreshToken };
    
    try {
      const response = await this.request<AuthenticationResponseApiResponse>(
        AUTH_ENDPOINTS.refreshToken,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );

      if (response.isSuccess && response.data) {
        this.saveTokens(response.data);
      } else {
        this.clearTokens();
      }

      return response;
    } catch {
      this.clearTokens();
      return null;
    }
  }
}

export const authService = new AuthService();
