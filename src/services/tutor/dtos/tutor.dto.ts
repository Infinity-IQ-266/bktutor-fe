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

export interface DashboardSession {
    id: number;
    subject: string;
    type: 'ONLINE' | 'IN_PERSON';
    locationOrLink: string;
    studentNotes?: string;
    status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'CANCELED';
    slotId: number;
    startTime: string;
    endTime: string;
    studentId: number;
    studentName: string;
    tutorId: number;
    tutorName: string;
}

export interface DashboardFeedback {
    id: number;
    rating: number;
    comment?: string;
    studentName: string;
    subject: string;
    createdAt: string;
}

export interface TutorDashboardDto {
    todaySessionsCount: number;
    activeStudentsCount: number;
    pendingRequestsCount: number;
    averageRating: number;
    pendingRequests: DashboardSession[];
    upcomingSessions: DashboardSession[];
    recentFeedback: DashboardFeedback[];
}
