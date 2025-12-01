import { BACKEND_URL } from '@/envs';
import client from '@/services/client';
import type { Availability } from '@/types';
import { toast } from 'sonner';

import type { Response } from '../response';
import type {
    GetTutorsRequestDto,
    GetTutorsResponseDto,
    TutorDashboardDto,
} from './dtos/tutor.dto';

const url = `${BACKEND_URL}/api/v1/tutors`;

export const TutorService = {
    getTutors: async (getTutorsRequestDto: GetTutorsRequestDto) => {
        try {
            const response = await client.get<Response<GetTutorsResponseDto>>(
                `${url}`,
                { params: getTutorsRequestDto },
            );

            return response.data.data;
        } catch (error) {
            console.log(error);
            toast.error('There is an error while try to get tutors');
        }
    },

    getTutorAvailabilityByTutorId: async (tutorId: number) => {
        try {
            const response = await client.get<Response<Availability[]>>(
                `${url}/${tutorId}/availability`,
            );

            return response.data.data;
        } catch (error) {
            console.log(error);
            toast.error(
                "There is an error while try to get tutor's availability",
            );
        }
    },

    getMyAvailability: async () => {
        try {
            // Note: This endpoint returns an array directly, not wrapped in Response<T>
            const response = await client.get<Availability[]>(
                `${url}/me/availability`,
            );

            return response.data;
        } catch (error) {
            console.log(error);
            toast.error('There is an error while try to get your availability');
        }
    },

    updateMyAvailability: async (
        slots: { startTime: string; endTime: string }[],
    ) => {
        try {
            const response = await client.put<Response<void>>(
                `${url}/me/availability`,
                { slots },
            );

            toast.success('Availability updated successfully');
            return response.data;
        } catch (error) {
            console.log(error);
            toast.error(
                'There is an error while try to update your availability',
            );
            throw error;
        }
    },

    getDashboard: async () => {
        try {
            const response = await client.get<Response<TutorDashboardDto>>(
                `${url}/dashboard`,
            );

            return response.data.data;
        } catch (error) {
            console.log(error);
            toast.error('Failed to load dashboard data');
            throw error;
        }
    },
};
