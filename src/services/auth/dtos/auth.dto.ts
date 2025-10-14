export type AuthRequestDto = {
    username: string;
    password: string;
};

export type AuthDto = {
    message: string;
    token: string;
    userId: number;
    fullName: string;
    faculty: string;
};
