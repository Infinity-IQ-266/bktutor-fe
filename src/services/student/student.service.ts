import { BACKEND_URL } from '@/envs';
import client from '@/services/client';
import type { Response } from '@/services/response';
import { toast } from 'sonner';

import type { GetDashboardDto } from './dtos/student.dto';

const url = `${BACKEND_URL}/api/v1/students`;

export const StudentService = {
    getDashboard: async () => {
        try {
            const response = await client.get<Response<GetDashboardDto>>(
                `${url}/dashboard`,
            );

            return response.data.data;
        } catch (error) {
            console.log(error);
            toast.error('There is an error while get student dashboard data');
        }
    },
};
