import type { PagedResponse, Tutor } from '@/types';

export type GetTutorsRequestDto = {
    page?: number;
    size?: number;
    direction: 'DESC' | 'ASC';
    attribute?: string;
    name?: string;
    department?: string;
};

export type GetTutorsResponseDto = PagedResponse & Tutor[];
