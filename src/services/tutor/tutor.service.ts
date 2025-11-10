import { BACKEND_URL } from '@/envs';
import client from '@/services/client';
import type { Availability } from '@/types';
import { toast } from 'sonner';

import type { Response } from '../response';
import type {
    GetTutorsRequestDto,
    GetTutorsResponseDto,
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
};
