export interface Service {
  _id: string;
  title: string;
  type: string;
  description: string;
  estimatedTime: string;
  price: number;
  features: string[];
  ideal: string;
  includes: string[];
  isActive: boolean;
  turnaround: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceResponse {
  data?: Service[];
  message?: string;
}

export interface CreateService {
  title: string;
  type: string;
  description?: string;
  price: number;
  features: string[];
  turnaround?: string;
  includes: string[];
  ideal?: string;
  estimatedTime?: string;
  isActive?: boolean;
}

export interface UpdateService {
  title?: string;
  type?: string;
  description?: string;
  price?: number;
  features?: string[];
  turnaround?: string;
  includes?: string[];
  ideal?: string[];
  estimatedTime?: string;
  isActive?: boolean;
}
