import { BACKEND_URL } from '@/envs';
import client from '@/services/client';
import { toast } from 'sonner';

import type { Response } from '../response';
import type {
    CreateBookingSessionRequestDto,
    CreateBookingSessionResponseDto,
    GetMyBookingsRequestDto,
    GetMyBookingsResponseDto,
} from './dtos/booking.dto';

const url = `${BACKEND_URL}/api/v1/bookings`;

export const BookingService = {
    createBookingSession: async (
        createBookingSessionRequestDto: CreateBookingSessionRequestDto,
    ) => {
        try {
            const response = await client.post<
                Response<CreateBookingSessionResponseDto>
            >(url, {
                ...createBookingSessionRequestDto,
            });

            return response.data.data;
        } catch (error) {
            console.log(error);
            toast.error(
                'There is an error while try to create a booking session',
            );
        }
    },

    getMyBookings: async (getMyBookingsRequestDto: GetMyBookingsRequestDto) => {
        try {
            const response = await client.get<
                Response<GetMyBookingsResponseDto>
            >(`${url}/me`, {
                params: getMyBookingsRequestDto,
            });

            return response.data.data;
        } catch (error) {
            console.log(error);
            toast.error('There is an error while try to get your bookings');
        }
    },

    cancelBooking: async (bookingId: number) => {
        try {
            const response = await client.post<Response<void>>(
                `${url}/${bookingId}/cancel`,
            );

            return response.data;
        } catch (error) {
            console.log(error);
            toast.error('There is an error while try to cancel booking');
        }
    },
};
