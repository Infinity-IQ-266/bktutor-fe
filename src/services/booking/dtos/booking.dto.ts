import type { SessionStatusType } from '@/types';

export type CreateBookingSessionRequestDto = {
    slotId: number;
    subject: string;
    type: string;
    locationOrLink: string;
    studentNotes?: string;
};

export type CreateBookingSessionResponseDto = {
    id: number;
    subject: string;
    type: 'ONLINE' | 'IN_PERSON';
    locationOrLink: string;
    studentNotes?: string;
    status: SessionStatusType;
    slotId: number;
    startTime: string;
    endTime: string;
    studentId: number;
    studentName: string;
    tutorId: number;
    tutorName: string;
};
