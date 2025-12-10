import { api } from '@/lib/api';
import { CreateUserDto, UpdateUserDto, IUser } from '@countries3/shared';

export const usersService = {
    getUsers: async () => {
        const response = await api.get<IUser[]>('/users');
        return response.data;
    },

    createUser: async (data: CreateUserDto) => {
        const response = await api.post<IUser>('/users', data);
        return response.data;
    },

    updateUser: async (id: string, data: UpdateUserDto) => {
        console.log('🌐 usersService.updateUser called');
        console.log('🌐 URL:', `/users/${id}`);
        console.log('🌐 Data:', JSON.stringify(data, null, 2));
        const response = await api.patch<IUser>(`/users/${id}`, data);
        console.log('🌐 Response:', response.data);
        return response.data;
    },

    deleteUser: async (id: string) => {
        const response = await api.delete<IUser>(`/users/${id}`);
        return response.data;
    }
};
