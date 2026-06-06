import { BookingStatus, PaymentMethod, PaymentStatus } from './enums';

export interface CreateBookingRequest {
  serviceId: string;
  pickupAddress: string;
  deliveryAddress: string;
  date: string;
  pickupTime: string;
  note?: string;
}

export interface UpdateBookingRequest {
  pickupAddress?: string;
  deliveryAddress?: string;
  date?: string;
  note?: string;
  status?: BookingStatus;
}

export interface BookingQueryParams {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
  serviceId?: string;
}

export interface BookingResponse {
  id: string;
  userId: string;
  serviceId: string;
  pickupAddress: string;
  deliveryAddress: string;
  date: string;
  status: BookingStatus;
  totalAmount: number;
  deliveryFee: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
  service: ServiceInfo;
  payment?: PaymentInfo;
}

export interface ServiceInfo {
  id: string;
  type: string;
  description?: string;
  price: number;
  estimatedTime?: string;
  isActive: boolean;
}

export interface PaymentInfo {
  id: string;
  transactionId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
}

export interface BookingListResponse {
  success: boolean;
  data: {
    bookings: BookingResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}
