export interface BookingResponse {
  data?: Booking;
  message?: string;
}

export interface Booking {
  _id: string;
  userId: string;
  serviceId: string;
  pickupAddress: string;
  deliveryAddress: string;
  date: string;
  pickupTime: string;
  status: BookingStatus;
  totalAmount: string;
  deliveryFee: string;
  note?: string | null;
  createdAt: string;
  updatedAt: string;

  user: {
    _id: string;
    name: string;
    email: string;
  };
  service: {
    _id: string;
    title: string;
    price: number;
  };
  payment?: {
    _id: string;
    transactionId: string;
    amount: string;
    currency: string;
    method: string;
    status: string;
  } | null;
}

export type BookingStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface CreateBooking {
  serviceId: string;
  pickupAddress: string;
  deliveryAddress?: string;
  date: string;
  pickupTime: string;
  serviceType?: string;
  note?: string;
  totalAmount: number;
}

export interface AdminCreateBooking {
  userId: string;
  serviceId: string;
  pickupAddress: string;
  deliveryAddress?: string;
  date: string;
  pickupTime: string;
  serviceType?: string;
  note?: string;
  totalAmount: number;
  deliveryFee: number;
}

export interface SchedulePickup {
  serviceId: number;
  pickupAddress: string;
  deliveryAddress?: string;
  date: string;
  pickupTime: string;
  note?: string;
}
