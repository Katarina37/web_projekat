import axios from "axios";
import type { LoginDto, RegisterDto, User } from "../models/User";

const BASE_URL = import.meta.env.VITE_USER_SERVICE_URL;

export const authService = {
    register: async (dto: RegisterDto) : Promise<User> => {
        const response = await axios.post(`${BASE_URL}/api/users/register`, dto);
        return response.data;
    },
    login: async (dto: LoginDto): Promise<{ token: string}> => {
        const response = await axios.post(`${BASE_URL}/api/users/login`, dto);
        return response.data;
    },
    getUserById: async (id: number, token: string): Promise<User> => {
        const response = await axios.get(`${BASE_URL}/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}`},
        });
        return response.data;
    },
    getAllUsers: async (token: string): Promise<User[]> => {
        const response = await axios.get(`${BASE_URL}/api/users`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    deleteUser: async (id: number, token: string): Promise<void> => {
        await axios.delete(`${BASE_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        });
    },

    makeAdmin: async (id: number, token: string): Promise<User> => {
        const response = await axios.patch(`${BASE_URL}/api/users/${id}/make-admin`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },
};