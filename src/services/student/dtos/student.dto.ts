import type { Progress, Session } from '@/types';

export type GetDashboardDto = {
    upcomingSessionsCount: number;
    totalSessionsCount: number;
    currentTutorsCount: number;
    attendanceRate: number;
    upcomingSessions: Session[];
    recentProgress: Progress[];
};
