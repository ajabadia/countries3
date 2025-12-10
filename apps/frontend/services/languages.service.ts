import { api } from '@/lib/api';
import { CreateLanguageDto, UpdateLanguageDto, ILanguage } from '@countries3/shared';

export const languagesService = {
    getLanguages: async (activeOnly?: boolean) => {
        const url = activeOnly ? '/languages?active=true' : '/languages';
        const response = await api.get<ILanguage[]>(url);
        return response.data;
    },

    getLanguage: async (id: string) => {
        const response = await api.get<ILanguage>(`/languages/${id}`);
        return response.data;
    },

    createLanguage: async (data: CreateLanguageDto) => {
        const response = await api.post<ILanguage>('/languages', data);
        return response.data;
    },

    updateLanguage: async (id: string, data: UpdateLanguageDto) => {
        const response = await api.patch<ILanguage>(`/languages/${id}`, data);
        return response.data;
    },

    deleteLanguage: async (id: string) => {
        const response = await api.delete<ILanguage>(`/languages/${id}`);
        return response.data;
    }
};
