import type {
  Booking,
  BookingResponse,
  BookingStatus,
  CreateBooking,
  AdminCreateBooking,
  SchedulePickup,
} from '@/types/booking';
import apiClient from '@/utils/api-client';
import type { BookingFormValues } from '@/utils/schemas/booking.schema';

/**
 * Schedule a pickup
 */
export const schedulePickup = async (
  pickupData: SchedulePickup,
): Promise<BookingResponse> => {
  try {
    const response = await apiClient.post<BookingResponse>(
      '/bookings/schedule-pickup',
      pickupData,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error scheduling pickup:', error);
    throw error.response?.data ?? error.message;
  }
};

/**
 * Create a new booking
 */
export const createBooking = async (
  bookingData: CreateBooking,
): Promise<BookingResponse> => {
  try {
    const response = await apiClient.post<BookingResponse>(
      '/bookings/create',
      bookingData,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating booking:', error);
    throw error.response?.data ?? error.message;
  }
};

/**
 * Create a new booking for admin/staff
 */
export const createAdminBooking = async (
  bookingData: AdminCreateBooking,
): Promise<BookingResponse> => {
  try {
    const response = await apiClient.post<BookingResponse>(
      '/bookings/admin/create-for-client',
      bookingData,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating admin booking:', error);
    throw error.response?.data ?? error.message;
  }
};

/**
 * Get all bookings (admin/staff only)
 */
export const getAllBookings = async (): Promise<Booking[]> => {
  const response = await apiClient.get<Booking[]>('/bookings/getAll');
  return response.data;
};

/**
 * Get all bookings (admin/staff only)
 */
export const getAllMyBookings = async (): Promise<Booking[]> => {
  const response = await apiClient.get<Booking[]>('/bookings/my-bookings');
  return response.data;
};

/**
 * Get a specific booking by ID
 */
export const getBookingById = async (
  bookingId: string,
): Promise<BookingResponse> => {
  const response = await apiClient.get<BookingResponse>(
    `/bookings/get/${bookingId}`,
  );
  return response.data;
};

/**
 * Update a booking
 */
export const updateBooking = async (
  bookingId: string,
  updateData: Partial<BookingFormValues>,
): Promise<BookingResponse> => {
  try {
    const response = await apiClient.patch<BookingResponse>(
      `/bookings/update/${bookingId}`,
      updateData,
    );
    return response.data;
  } catch (error: any) {
    console.error(`Error updating booking ${bookingId}:`, error);
    throw error.response?.data ?? error.message;
  }
};

/**
 * Update a booking status
 */
export const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus,
): Promise<BookingResponse> => {
  try {
    const response = await apiClient.patch<BookingResponse>(
      `/bookings/update-status/${bookingId}`,
      { status },
    );
    return response.data;
  } catch (error: any) {
    console.error(`Error updating booking ${bookingId}:`, error);
    throw error.response?.data ?? error.message;
  }
};

/**
 * Delete a booking
 */
export const deleteBooking = async (
  bookingId: string,
): Promise<BookingResponse> => {
  try {
    const response = await apiClient.delete<BookingResponse>(
      `/bookings/delete/${bookingId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error(`Error deleting booking ${bookingId}:`, error);
    throw error.response?.data ?? error.message;
  }
};

/**
 * Get user bookings
 */
export const getUserBookings = async (): Promise<BookingResponse> => {
  try {
    const response = await apiClient.get<BookingResponse>('/booking/user');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user bookings:', error);
    throw error.response?.data ?? error.message;
  }
};
