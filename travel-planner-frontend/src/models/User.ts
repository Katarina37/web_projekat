export interface User{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    createdAt: string;
}

export interface RegisterDto{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface LoginDto{
    email: string;
    password: string;
}