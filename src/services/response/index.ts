import type { HttpStatusCode } from 'axios';

export type Response<T> = {
    serverDateTime: string;
    status: HttpStatusCode;
    code: number;
    message: string;
    data: T;
};
