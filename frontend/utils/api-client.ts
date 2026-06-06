import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from 'axios';
import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { Permission } from '@/types/permission';
import type { User } from '@/types/user';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'https://tylers-laundry-api-ckl4.onrender.com/api/v1';

// User roles enum
export enum UserRole {
  USER = 'USER',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
}

// Role hierarchy for permission checking
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.USER]: 1,
  [UserRole.STAFF]: 2,
  [UserRole.ADMIN]: 3,
};

// Permissions by role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.USER]: [
    Permission.PROFILE_VIEW_OWN,
    Permission.PROFILE_UPDATE_OWN,
    Permission.BOOKING_CREATE,
    Permission.BOOKING_UPDATE_OWN,
    Permission.BOOKING_VIEW_OWN,
    Permission.SERVICE_VIEW,
    Permission.TESTIMONIAL_CREATE,
  ],
  [UserRole.STAFF]: [
    Permission.PROFILE_VIEW_OWN,
    Permission.PROFILE_UPDATE_OWN,
    Permission.BOOKING_VIEW_ALL,
    Permission.BOOKING_UPDATE_STATUS,
    Permission.USER_VIEW,
    Permission.SERVICE_VIEW,
    Permission.SERVICE_UPDATE,
    Permission.ANALYTICS_VIEW,
    Permission.REPORTS_VIEW,
    Permission.PDF_GENERATE_INVOICE,
    Permission.PDF_GENERATE_RECEIPT,
  ],
  [UserRole.ADMIN]: [
    Permission.PROFILE_VIEW_OWN,
    Permission.PROFILE_UPDATE_OWN,
    Permission.BOOKING_VIEW_ALL,
    Permission.BOOKING_UPDATE,
    Permission.BOOKING_UPDATE_STATUS,
    Permission.BOOKING_DELETE,
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_CONFIRM_STAFF,
    Permission.SERVICE_VIEW,
    Permission.SERVICE_CREATE,
    Permission.SERVICE_UPDATE,
    Permission.SERVICE_DELETE,
    Permission.ANALYTICS_VIEW,
    Permission.PAYMENT_VIEW_ALL,
    Permission.PAYMENT_CREATE,
    Permission.PAYMENT_UPDATE,
    Permission.PAYMENT_DELETE,
    Permission.PAYMENT_PROCESS,
    Permission.INVOICE_VIEW_ALL,
    Permission.INVOICE_CREATE,
    Permission.INVOICE_UPDATE,
    Permission.INVOICE_DELETE,
    Permission.INVOICE_GENERATE,
    Permission.RECEIPT_VIEW_ALL,
    Permission.RECEIPT_CREATE,
    Permission.RECEIPT_UPDATE,
    Permission.RECEIPT_DELETE,
    Permission.RECEIPT_GENERATE,
    Permission.TESTIMONIAL_VIEW,
    Permission.TESTIMONIAL_UPDATE,
    Permission.TESTIMONIAL_DELETE,
    Permission.TESTIMONIAL_MANAGE,
    Permission.REPORTS_VIEW,
    Permission.REPORTS_GENERATE,
    Permission.REPORTS_EXPORT,
    Permission.PDF_GENERATE_INVOICE,
    Permission.PDF_GENERATE_RECEIPT,
    Permission.PDF_GENERATE_REPORT,
    Permission.SETTINGS_UPDATE,
    Permission.STAFF_MANAGE,
    Permission.STAFF_VIEW,
    Permission.STAFF_CREATE,
    Permission.STAFF_UPDATE,
    Permission.STAFF_DELETE,
    Permission.ROLE_VIEW,
    Permission.ROLE_CREATE,
    Permission.ROLE_UPDATE,
    Permission.ROLE_DELETE,
    Permission.PERMISSION_ASSIGN,
  ],
};

/**
 * Role Manager
 * Handles role-based permissions and access control
 */
export class RoleManager {
  private static currentRole: UserRole | null = null;
  private static currentUserId: string | null = null;
  private static currentPermissions: Permission[] = [];

  static setUserInfo(user: {
    id: string;
    role: UserRole;
    permissions?: Permission[];
  }) {
    this.currentRole = user.role;
    this.currentUserId = user.id;
    this.currentPermissions =
      user.permissions && user.permissions.length > 0
        ? user.permissions
        : this.getDefaultPermissionsForRole(user.role);

    console.log('🔐 RoleManager.setUserInfo:', {
      userId: user.id,
      role: user.role,
      permissionsFromUser: user.permissions,
      permissionsLength: user.permissions?.length,
      usingDefaultPermissions: !(
        user.permissions && user.permissions.length > 0
      ),
      finalPermissions: this.currentPermissions,
      hasRoleView: this.currentPermissions.includes(Permission.ROLE_VIEW),
    });
  }

  static getCurrentRole(): UserRole | null {
    return this.currentRole;
  }

  static getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  static getCurrentPermissions(): Permission[] {
    return this.currentPermissions;
  }

  static clearUserInfo() {
    this.currentRole = null;
    this.currentUserId = null;
    this.currentPermissions = [];
  }

  static hasRole(role: UserRole): boolean {
    return this.currentRole === role;
  }

  static hasPermission(permission: Permission): boolean {
    const hasPerm = this.currentPermissions.includes(permission);
    console.log('🔍 RoleManager.hasPermission:', {
      permission,
      currentPermissions: this.currentPermissions,
      hasPermission: hasPerm,
      currentRole: this.currentRole,
    });
    return hasPerm;
  }

  static hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(p => this.currentPermissions.includes(p));
  }

  static hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(p => this.currentPermissions.includes(p));
  }

  static hasAnyRole(roles: UserRole[]): boolean {
    return this.currentRole ? roles.includes(this.currentRole) : false;
  }

  static hasRoleLevel(role: UserRole): boolean {
    if (!this.currentRole) return false;
    return ROLE_HIERARCHY[this.currentRole] >= ROLE_HIERARCHY[role];
  }

  static canAccessAdmin(): boolean {
    return this.hasRoleLevel(UserRole.ADMIN);
  }

  static canAccessStaff(): boolean {
    return this.hasRoleLevel(UserRole.STAFF);
  }

  static isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  static isStaff(): boolean {
    return this.hasRole(UserRole.STAFF);
  }

  static isUser(): boolean {
    return this.hasRole(UserRole.USER);
  }

  private static getDefaultPermissionsForRole(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }
}

/**
 * Cache Manager
 * Handles caching for role-specific data with TTL support
 */
export class CacheManager {
  private static cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  static set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    const cacheKey = this.getRoleScopedKey(key);
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  static get<T>(key: string): T | null {
    const cacheKey = this.getRoleScopedKey(key);
    const cached = this.cache.get(cacheKey);

    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.data as T;
  }

  static delete(key: string): void {
    const cacheKey = this.getRoleScopedKey(key);
    this.cache.delete(cacheKey);
  }

  static deletePattern(pattern: string): void {
    const rolePrefix = RoleManager.getCurrentRole() ?? 'guest';
    const fullPattern = `${rolePrefix}:${pattern}`;

    for (const key of this.cache.keys()) {
      if (key.includes(fullPattern)) {
        this.cache.delete(key);
      }
    }
  }

  static clear(): void {
    this.cache.clear();
  }

  static clearRoleCache(): void {
    const role = RoleManager.getCurrentRole();
    if (!role) {
      this.clear();
      return;
    }

    const rolePrefix = `${role}:`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(rolePrefix)) {
        this.cache.delete(key);
      }
    }
  }

  static has(key: string): boolean {
    const cacheKey = this.getRoleScopedKey(key);
    const cached = this.cache.get(cacheKey);

    if (!cached) return false;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(cacheKey);
      return false;
    }

    return true;
  }

  static getCacheInfo(): {
    size: number;
    keys: string[];
    role: UserRole | null;
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      role: RoleManager.getCurrentRole(),
    };
  }

  private static getRoleScopedKey(key: string): string {
    const role = RoleManager.getCurrentRole();
    return role ? `${role}:${key}` : `guest:${key}`;
  }
}

/**
 * Error types for better error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public data?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NetworkError extends ApiError {
  constructor(message = 'Network error occurred') {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

/**
 * Request queue for handling concurrent requests during token refresh
 */
class RequestQueue {
  private queue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  add(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject });
    });
  }

  processAll(error: any = null, token: string | null = null) {
    this.queue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else if (token) {
        resolve(token);
      }
    });
    this.clear();
  }

  clear() {
    this.queue = [];
  }

  get size() {
    return this.queue.length;
  }
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private requestQueue = new RequestQueue();
  private refreshCheckTimeout: NodeJS.Timeout | null = null;
  private readonly TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes
  private readonly TOKEN_CHECK_INTERVAL = 60 * 1000; // 1 minute
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    this.setupInterceptors();
    this.startTokenRefreshCheck();
  }

  /**
   * Start checking token expiration periodically
   */
  private startTokenRefreshCheck() {
    this.refreshCheckTimeout = setInterval(async () => {
      await this.checkAndRefreshTokenIfNeeded();
    }, this.TOKEN_CHECK_INTERVAL);
  }

  /**
   * Stop token refresh check (cleanup)
   */
  private stopTokenRefreshCheck() {
    if (this.refreshCheckTimeout) {
      clearInterval(this.refreshCheckTimeout);
      this.refreshCheckTimeout = null;
    }
  }

  /**
   * Check if token is about to expire and refresh if needed
   */
  private async checkAndRefreshTokenIfNeeded() {
    try {
      const session = await getSession();
      if (!session?.accessToken) return;

      const tokenExpiry = this.getTokenExpiry(session.accessToken);
      if (!tokenExpiry) return;

      const now = Date.now();
      const timeUntilExpiry = tokenExpiry - now;

      if (
        timeUntilExpiry < this.TOKEN_REFRESH_THRESHOLD &&
        timeUntilExpiry > 0
      ) {
        console.log(
          `Token expiring in ${Math.round(timeUntilExpiry / 1000)}s, refreshing...`,
        );
        await this.refreshToken();
      }
    } catch (error) {
      console.error('Error checking token expiry:', error);
    }
  }

  /**
   * Extract expiration time from JWT token
   */
  private getTokenExpiry(token: string): number | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const decoded = JSON.parse(atob(parts[1]));
      return decoded.exp ? decoded.exp * 1000 : null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(token: string): boolean {
    const expiry = this.getTokenExpiry(token);
    if (!expiry) return false;
    return Date.now() >= expiry;
  }

  /**
   * Check if token will expire soon
   */
  private isTokenExpiringSoon(token: string): boolean {
    const expiry = this.getTokenExpiry(token);
    if (!expiry) return false;
    const timeUntilExpiry = expiry - Date.now();
    return (
      timeUntilExpiry < this.TOKEN_REFRESH_THRESHOLD && timeUntilExpiry > 0
    );
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        console.log('🔑 API Client - Making request to:', config.url);
        const session = await getSession();
        console.log(
          '🔑 API Client - Session:',
          session ? 'Found' : 'Not found',
        );
        console.log(
          '🔑 API Client - Access token:',
          session?.accessToken ? 'Present' : 'Missing',
        );

        if (session?.accessToken) {
          let token = session.accessToken;

          // Proactively refresh token if expired or expiring soon
          if (this.isTokenExpired(token) || this.isTokenExpiringSoon(token)) {
            try {
              token = await this.refreshToken();
              // Unblock any requests that queued while this refresh was in flight
              this.requestQueue.processAll(null, token);
            } catch (error) {
              this.requestQueue.processAll(error, null);
              console.error('Failed to refresh token:', error);
            }
          }

          config.headers.Authorization = `Bearer ${token}`;

          // Add role information
          const user = session.user as any;
          if (user?.role) {
            config.headers['X-User-Role'] = user.role;
          }
          if (user?.id) {
            config.headers['X-User-Id'] = user.id;
          }
        }
        return config;
      },
      error => Promise.reject(this.handleError(error)),
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(
          '🔑 API Client - Response success for:',
          response.config.url,
        );
        return response;
      },
      async error => {
        // Don't log 500 errors for /user/me as loudly since they might be backend issues
        if (
          error.response?.status === 500 &&
          error.config?.url === '/user/me'
        ) {
          console.warn(
            '⚠️ API Client - Backend error for user profile (may be temporary):',
            error.response?.status,
          );
        } else {
          console.error(
            '🔑 API Client - Response error for:',
            error.config?.url,
            error.response?.status,
            error.response?.data,
          );
        }
        const originalRequest = error.config;

        // Handle 403 Forbidden (Authorization)
        if (error.response?.status === 403) {
          const errorMessage = error.response.data?.message ?? 'Access denied';

          if (
            errorMessage.toLowerCase().includes('role') ||
            errorMessage.toLowerCase().includes('permission')
          ) {
            CacheManager.clearRoleCache();
          }

          return Promise.reject(new AuthorizationError(errorMessage));
        }

        // Handle 401 Unauthorized (Authentication)
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            try {
              const token = await this.requestQueue.add();
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.client(originalRequest);
            } catch (err) {
              return Promise.reject(this.handleError(err));
            }
          }

          originalRequest._retry = true;

          try {
            const newToken = await this.refreshToken();
            this.requestQueue.processAll(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.requestQueue.processAll(refreshError, null);
            await this.handleAuthenticationFailure();
            return Promise.reject(new AuthenticationError());
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.handleError(error));
      },
    );
  }

  /**
   * Handle authentication failure (clear data and sign out)
   */
  private async handleAuthenticationFailure() {
    RoleManager.clearUserInfo();
    CacheManager.clear();
    this.stopTokenRefreshCheck();

    try {
      await signOut({ callbackUrl: '/login', redirect: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  /**
   * Refresh access token
   */
  private async refreshToken(): Promise<string> {
    if (this.isRefreshing) {
      return this.requestQueue.add();
    }

    this.isRefreshing = true;

    try {
      const session = await getSession();
      if (!session?.user) {
        throw new AuthenticationError('No session available');
      }

      const refreshToken = (session as any).refreshToken;
      if (!refreshToken) {
        throw new AuthenticationError('No refresh token available');
      }

      const response = await axios.post(
        `${BASE_URL}/auth/refresh-token`,
        { refreshToken },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        },
      );

      const { accessToken: newAccessToken } = response.data;
      if (!newAccessToken) {
        throw new AuthenticationError('No access token in refresh response');
      }

      console.log('✅ Token refreshed successfully');
      return newAccessToken;
    } catch (error: any) {
      console.error('❌ Token refresh failed:', error.message);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Enhanced error handling
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Network errors
      if (!axiosError.response) {
        return new NetworkError(axiosError.message ?? 'Network error occurred');
      }

      // HTTP errors
      const status = axiosError.response.status;
      const data = axiosError.response.data as any;
      const message = data?.message ?? axiosError.message;

      if (status === 401) {
        return new AuthenticationError(message);
      }

      if (status === 403) {
        return new AuthorizationError(message);
      }

      return new ApiError(message, status, data?.code, data);
    }

    return error instanceof Error ? error : new Error(String(error));
  }

  /**
   * Retry logic for failed requests
   */
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retries = this.MAX_RETRY_ATTEMPTS,
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        await this.delay(this.RETRY_DELAY);
        return this.retryRequest(requestFn, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (error instanceof NetworkError) return true;
    if (error instanceof AuthenticationError) return false;
    if (error instanceof AuthorizationError) return false;

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      // Retry on 5xx errors and network errors
      return !status || status >= 500;
    }

    return false;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public get instance(): AxiosInstance {
    return this.client;
  }

  // HTTP methods with retry logic
  public async get<T = any>(
    url: string,
    config?: any,
  ): Promise<AxiosResponse<T>> {
    return this.retryRequest(() => this.client.get<T>(url, config));
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: any,
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: any,
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  public async delete<T = any>(
    url: string,
    config?: any,
  ): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: any,
  ): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  // Role-specific methods
  hasPermission(permission: string): boolean {
    return RoleManager.hasPermission(permission as Permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return RoleManager.hasAnyPermission(permissions as Permission[]);
  }

  hasAllPermissions(permissions: string[]): boolean {
    return RoleManager.hasAllPermissions(permissions as Permission[]);
  }

  hasRole(role: UserRole): boolean {
    return RoleManager.hasRole(role);
  }

  hasRoleLevel(role: UserRole): boolean {
    return RoleManager.hasRoleLevel(role);
  }

  // Cache methods
  getCached<T>(key: string): T | null {
    return CacheManager.get<T>(key);
  }

  setCached(key: string, data: any, ttl?: number): void {
    CacheManager.set(key, data, ttl);
  }

  deleteCached(key: string): void {
    CacheManager.delete(key);
  }

  clearRoleCache(): void {
    CacheManager.clearRoleCache();
  }

  // Admin API methods
  async getAdminDashboard(): Promise<any> {
    if (!RoleManager.canAccessAdmin()) {
      throw new AuthorizationError('Admin access required');
    }

    const cacheKey = 'admin-dashboard';
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const { data } = await this.get('/admin/dashboard');
    CacheManager.set(cacheKey, data, 10 * 60 * 1000);
    return data;
  }

  async getAllUsers(): Promise<any> {
    if (!RoleManager.canAccessAdmin()) {
      throw new AuthorizationError('Admin access required');
    }

    const cacheKey = 'all-users';
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const { data } = await this.get('/admin/users');
    CacheManager.set(cacheKey, data, 5 * 60 * 1000);
    return data;
  }

  async updateUserRole(userId: string, role: UserRole): Promise<any> {
    if (!RoleManager.canAccessAdmin()) {
      throw new AuthorizationError('Admin access required');
    }

    const { data } = await this.patch(`/admin/users/${userId}/role`, { role });
    CacheManager.clearRoleCache();
    return data;
  }

  // Staff API methods
  async getStaffBookings(): Promise<any> {
    if (!RoleManager.canAccessStaff()) {
      throw new AuthorizationError('Staff access required');
    }

    const cacheKey = 'staff-bookings';
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const { data } = await this.get('/staff/bookings');
    CacheManager.set(cacheKey, data, 2 * 60 * 1000);
    return data;
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<any> {
    if (!RoleManager.canAccessStaff()) {
      throw new AuthorizationError('Staff access required');
    }

    const { data } = await this.patch(`/staff/bookings/${bookingId}/status`, {
      status,
    });
    CacheManager.delete('staff-bookings');
    return data;
  }

  // Staff Dashboard methods
  async getStaffDashboardStats(): Promise<any> {
    if (!RoleManager.canAccessStaff()) {
      throw new AuthorizationError('Staff access required');
    }

    const cacheKey = 'staff-dashboard-stats';
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const { data } = await this.get('/staff/dashboard/stats');
    CacheManager.set(cacheKey, data, 5 * 60 * 1000);
    return data;
  }

  async getStaffRecentBookings(limit: number = 10): Promise<any> {
    if (!RoleManager.canAccessStaff()) {
      throw new AuthorizationError('Staff access required');
    }

    const cacheKey = `staff-recent-bookings-${limit}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const { data } = await this.get('/staff/dashboard/recent-bookings', {
      params: { limit },
    });
    CacheManager.set(cacheKey, data, 2 * 60 * 1000);
    return data;
  }

  async getStaffDailyOverview(): Promise<any> {
    if (!RoleManager.canAccessStaff()) {
      throw new AuthorizationError('Staff access required');
    }

    const cacheKey = 'staff-daily-overview';
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const { data } = await this.get('/staff/dashboard/daily-overview');
    CacheManager.set(cacheKey, data, 5 * 60 * 1000);
    return data;
  }

  // User API methods
  async getUserBookings(): Promise<any> {
    const userId = RoleManager.getCurrentUserId();
    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }

    const cacheKey = `user-bookings-${userId}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const { data } = await this.get('/user/bookings');
    CacheManager.set(cacheKey, data, 5 * 60 * 1000);
    return data;
  }

  async createBooking(bookingData: any): Promise<any> {
    const userId = RoleManager.getCurrentUserId();
    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }

    const { data } = await this.post('/bookings', { ...bookingData, userId });
    CacheManager.delete(`user-bookings-${userId}`);
    return data;
  }

  async getUserProfile(): Promise<any> {
    const userId = RoleManager.getCurrentUserId();
    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }

    const cacheKey = `user-profile-${userId}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const { data } = await this.get('/user/profile');
    CacheManager.set(cacheKey, data, 10 * 60 * 1000);
    return data;
  }

  // Public API methods
  async getServices(): Promise<any> {
    const cacheKey = 'services';
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const { data } = await this.get('/services');
    CacheManager.set(cacheKey, data, 30 * 60 * 1000);
    return data;
  }

  async getServiceById(serviceId: string): Promise<any> {
    const cacheKey = `service-${serviceId}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const { data } = await this.get(`/services/${serviceId}`);
    CacheManager.set(cacheKey, data, 30 * 60 * 1000);
    return data;
  }

  // Get current user with role management
  async getCurrentUser() {
    const response = await this.client.get<User>('/user/me');

    if (response.data) {
      RoleManager.setUserInfo({
        id: response.data._id,
        role: response.data.role as UserRole,
        permissions: response.data.permissions as Permission[],
      });
    }

    return response;
  }

  getCurrentUserInfo(): {
    _id: string | null;
    role: UserRole | null;
    permissions: string[];
  } {
    return {
      _id: RoleManager.getCurrentUserId(),
      role: RoleManager.getCurrentRole(),
      permissions: RoleManager.getCurrentPermissions(),
    };
  }

  isAuthenticated(): boolean {
    return !!RoleManager.getCurrentRole() && !!RoleManager.getCurrentUserId();
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.stopTokenRefreshCheck();
    this.requestQueue.clear();
    RoleManager.clearUserInfo();
    CacheManager.clear();
  }
}

// Singleton instance
const apiClient = new ApiClient();

// Cleanup on window unload (browser only)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    apiClient.cleanup();
  });
}

export default apiClient;
