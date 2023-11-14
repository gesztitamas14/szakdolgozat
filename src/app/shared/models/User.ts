export interface User{
    id: string,
    email: string;
    name:{
        firstname: string;
        lastname: string;
    }
    username: string;
}