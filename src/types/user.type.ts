export const Role = {
    STUDENT: 'STUDENT',
    TUTOR: 'TUTOR',
    COORDINATOR: 'COORDINATOR',
    DEPARTMENT_CHAIR: 'DEPARTMENT_CHAIR',
    PROGRAM_ADMINISTRATOR: 'PROGRAM_ADMINISTRATOR',
} as const;

export type RoleType = (typeof Role)[keyof typeof Role];

export type BaseUser = {
    id: number;
    username: string;
    fullName: string;
    email: string;
    phone: string;
    avatarUrl?: string;
    role: RoleType;
    faculty: string;
};

export type Tutor = BaseUser & {
    role: 'TUTOR';
    staffId: string;
    position: string;
    degree: string;
    bio: string;
    expertise: string;
    averageRating: string;
    departmentName: string;
    subjects: string[];
};

export type Student = BaseUser & {
    role: 'STUDENT';
    studentId: string;
    major: string;
    academicYear: number;
    className: string;
    departmentName: string;
};

export type DepartmentChair = BaseUser & {
    role: 'DEPARTMENT_CHAIR';
};

export type ProgramAdministrator = BaseUser & {
    role: 'PROGRAM_ADMINISTRATOR';
};

export type Coordinator = BaseUser & {
    role: 'COORDINATOR';
};

export type User =
    | Tutor
    | Student
    | DepartmentChair
    | ProgramAdministrator
    | Coordinator;
