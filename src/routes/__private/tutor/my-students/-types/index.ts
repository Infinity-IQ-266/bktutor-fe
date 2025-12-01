export interface Note {
    date: string;
    note: string;
}

export interface Student {
    id: number;
    name: string;
    studentId: string;
    email: string;
    phone: string;
    faculty: string;
    year: string;
    subjects: string[];
    totalSessions: number;
    attendanceRate: string;
    lastSession: string;
    progress: string;
    status: string;
    notes: Note[];
}

export interface PastStudent {
    id: number;
    name: string;
    studentId: string;
    email: string;
    phone: string;
    faculty: string;
    year: string;
    subjects: string[];
    totalSessions: number;
    completedDate: string;
    finalNote: string;
}
