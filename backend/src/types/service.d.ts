export interface ServiceDetails {
  turnaround: string;
  includes: string[];
  ideal: string;
}

export interface CreateServiceRequest {
  title: string;
  type: string;
  description?: string;
  price: number;
  features: string[];
  turnaround?: string;
  includes: string[];
  ideal?: string;
  estimatedTime?: string;
}

export interface UpdateServiceRequest {
  title?: string;
  type?: string;
  description?: string;
  price?: number;
  features?: string[];
  turnaround?: string;
  includes?: string[];
  ideal?: string;
  estimatedTime?: string;
  isActive?: boolean;
}

export interface ServiceQueryParams {
  page?: number;
  limit?: number;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
}

export interface ServiceResponse {
  id: string;
  type: string;
  description: string;
  price: number;
  estimatedTime?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceInfo {
  id: string;
  type: string;
  description: string;
  price: number;
}

export interface ServicesListResponse {
  services: ServiceResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
