export type Availability = {
    id: number;
    startTime: string;
    endTime: string;
    status: 'AVAILABLE' | 'UNAVAILABLE';
};
