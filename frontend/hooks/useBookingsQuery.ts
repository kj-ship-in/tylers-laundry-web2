'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createBooking,
  createAdminBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getUserBookings,
  getAllMyBookings,
  updateBookingStatus,
  schedulePickup,
} from '@/services/booking';
import type { BookingFormValues } from '@/utils/schemas/booking.schema';
import type {
  BookingStatus,
  CreateBooking,
  AdminCreateBooking,
  SchedulePickup,
} from '@/types/booking';

const BOOKINGS_QUERY_KEY = ['bookings'];
const BOOKINGS_MY_QUERY_KEY = ['my-bookings'];
const USER_BOOKINGS_QUERY_KEY = ['bookings', 'user'];

/**
 * Hook to fetch all bookings (admin/staff only)
 */
export const useFetchAllBookings = () => {
  return useQuery({
    queryKey: BOOKINGS_QUERY_KEY,
    queryFn: getAllBookings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch all my bookings (admin/staff only)
 */
export const useFetchAllMyBookings = () => {
  return useQuery({
    queryKey: BOOKINGS_MY_QUERY_KEY,
    queryFn: getAllMyBookings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch a specific booking by ID
 */
export const useFetchBookingById = (bookingId: string | null) => {
  return useQuery({
    queryKey: ['bookings', bookingId],
    queryFn: () => getBookingById(bookingId!),
    enabled: !!bookingId, // Only run query if bookingId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch user's bookings
 */
export const useFetchUserBookings = () => {
  return useQuery({
    queryKey: USER_BOOKINGS_QUERY_KEY,
    queryFn: getUserBookings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to create a new booking
 */
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingData: CreateBooking) => createBooking(bookingData),
    onSuccess: () => {
      // Invalidate bookings queries to refetch
      queryClient.invalidateQueries({ queryKey: USER_BOOKINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY });
    },
    onError: error => {
      console.error('Failed to create booking:', error);
    },
  });
};

/**
 * Hook to create a new admin booking
 */
export const useCreateAdminBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingData: AdminCreateBooking) =>
      createAdminBooking(bookingData),
    onSuccess: () => {
      // Invalidate bookings queries to refetch
      queryClient.invalidateQueries({ queryKey: USER_BOOKINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY });
    },
    onError: error => {
      console.error('Failed to create admin booking:', error);
    },
  });
};

/**
 * Hook to schedule a pickup
 */
export const useSchedulePickup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pickupData: SchedulePickup) => schedulePickup(pickupData),
    onSuccess: () => {
      // Invalidate bookings queries to refetch
      queryClient.invalidateQueries({ queryKey: USER_BOOKINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY });
    },
    onError: error => {
      console.error('Failed to schedule pickup:', error);
    },
  });
};

/**
 * Hook to update a booking
 */
export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      updateData,
    }: {
      bookingId: string;
      updateData: Partial<BookingFormValues>;
    }) => updateBooking(bookingId, updateData),
    onSuccess: () => {
      // Invalidate bookings queries to refetch
      queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USER_BOOKINGS_QUERY_KEY });
    },
    onError: error => {
      console.error('Failed to update booking:', error);
    },
  });
};

/**
 * Hook to update a booking status
 */
export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      status,
    }: {
      bookingId: string;
      status: BookingStatus;
    }) => updateBookingStatus(bookingId, status),
    onSuccess: () => {
      // Invalidate bookings queries to refetch
      queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USER_BOOKINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['recent-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['daily-overview'] });
    },
    onError: error => {
      console.error('Failed to update booking status:', error);
    },
  });
};

/**
 * Hook to delete a booking
 */
export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => deleteBooking(bookingId),
    onSuccess: () => {
      // Invalidate bookings queries to refetch
      queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USER_BOOKINGS_QUERY_KEY });
    },
    onError: error => {
      console.error('Failed to delete booking:', error);
    },
  });
};
