export interface User{
    id: string,
    email: string;
    imageURL?: string;
    phoneNumber: number;
    name:{
        firstname: string;
        lastname: string;
    }
    username: string;
    isAdmin: boolean;
}