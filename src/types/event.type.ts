import type { TicketType } from '.';

export type Event = {
    id: number;
    title: string;
    description?: string;
    startDate: Date | null;
    endDate: Date | null;
    location: string;
    organizationId: number;
    organizationName: string;
    ticketTypes: TicketType[];
};
