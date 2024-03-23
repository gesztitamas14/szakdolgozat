export interface User{
    id: string,
    email: string;
    imageURL?: string;
    name:{
        firstname: string;
        lastname: string;
    }
    username: string;
}