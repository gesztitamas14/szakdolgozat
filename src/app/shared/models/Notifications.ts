export interface Notification {
    id: string;
    userID: string;
    type: string;
    message: string;
    createdAt: Date;
    read: boolean;
}