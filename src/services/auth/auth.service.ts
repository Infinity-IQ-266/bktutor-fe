import { BACKEND_URL } from '@/envs';
import client from 'axios';
import { toast } from 'sonner';

import type { Response } from '../response';
import type { AuthDto, AuthRequestDto } from './dtos/auth.dto';

export const AuthService = {
    getToken: async (authRequestDto: AuthRequestDto) => {
        try {
            const response = await client.post<Response<AuthDto>>(
                `${BACKEND_URL}/api/v1/auth/login`,
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
};
