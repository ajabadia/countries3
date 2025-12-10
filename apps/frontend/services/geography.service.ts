import { api } from '@/lib/api';
import { IArea, CreateAreaDto, UpdateAreaDto } from '@countries3/shared';

export const geographyService = {
    getRoots: async () => {
        const response = await api.get<IArea[]>('/geography/areas/roots');
        return response.data;
    },

    getChildren: async (id: string) => {
        const response = await api.get<IArea[]>(`/geography/areas/${id}/children`);
        return response.data;
    },

    getArea: async (id: string) => {
        const response = await api.get<IArea>(`/geography/areas/${id}`);
        return response.data;
    },

    create: async (data: CreateAreaDto) => {
        const response = await api.post<IArea>('/geography/areas', data);
        return response.data;
    },

    createBulk: async (data: CreateAreaDto[]) => {
        const response = await api.post<IArea[]>('/geography/areas/bulk', data);
        return response.data;
    },

    update: async (id: string, data: UpdateAreaDto) => {
        const response = await api.patch<IArea>(`/geography/areas/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/geography/areas/${id}`);
    }
};
