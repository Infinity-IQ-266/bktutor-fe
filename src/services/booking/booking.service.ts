import { BACKEND_URL } from '@/envs';
import client from '@/services/client';
import { toast } from 'sonner';

import type { Response } from '../response';
import type {
    CreateBookingSessionRequestDto,
    CreateBookingSessionResponseDto,
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
};
