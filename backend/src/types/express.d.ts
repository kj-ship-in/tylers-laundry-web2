import { UserPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }

    interface Response {
      success(data: any, message?: string, statusCode?: number): Response;
      error(message: string, statusCode?: number, errors?: any[]): Response;
    }
  }
}

// Common API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ControllerResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
}
