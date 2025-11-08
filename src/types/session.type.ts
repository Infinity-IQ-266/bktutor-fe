export const SessionStatus = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    REJECTED: 'REJECTED',
    COMPLETED: 'COMPLETED',
    CANCELED: 'CANCELED',
} as const;

export type SessionStatusType =
    (typeof SessionStatus)[keyof typeof SessionStatus];

export type Session = {
    id: number;
    subject: string;
    type: 'ONLINE' | 'IN_PERSON';
    locationOrLink: string;
    studentNotes: string;
    status: SessionStatusType;
    slotId: number;
    startTime: string;
    endTime: string;
    studentId: number;
    studentName: string;
    tutorId: number;
    tutorName: string;
};
