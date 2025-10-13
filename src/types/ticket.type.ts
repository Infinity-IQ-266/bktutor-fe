export type TicketType = {
    id: string;
    type: string;
    price: number;
    totalQuantity: number;
    remainingQuantity: number;
    status: string | null;
};

export type Ticket = {
    id: number;
    orderId: number;
    eventId: number;
    checkedIn: boolean;
    eventLocation: string;
    eventName: string;
    eventStartDate: string;
    qrCode: string;
    ticketTypeName: string;
};
