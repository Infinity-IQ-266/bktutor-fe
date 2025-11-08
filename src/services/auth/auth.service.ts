import { BACKEND_URL } from '@/envs';
import client from '@/services/client';
import type { User } from '@/types';
import { toast } from 'sonner';

import type { Response } from '../response';
import type { AuthDto, AuthRequestDto } from './dtos/auth.dto';

const url = `${BACKEND_URL}/api/v1/auth`;

export const AuthService = {
    getToken: async (authRequestDto: AuthRequestDto) => {
        try {
            const response = await client.post<Response<AuthDto>>(
                `${url}/login`,
                {
                    username: authRequestDto.username,
                    password: authRequestDto.password,
                },
            );
            return response.data.data;
        } catch (error) {
            console.log(error);
            toast.error('There is an error while try to login');
        }
    },

    getMe: async () => {
        try {
            const response = await client.get<Response<User>>(`${url}/me`);

            return response.data.data;
        } catch (error) {
            console.log(error);
            toast.error('There is an error while try to get user data');
        }
    },
};
