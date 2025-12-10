import { api } from '@/lib/api';
import { IAuditLog } from '@countries3/shared';

export const auditService = {
    getLogs: async (limit: number = 50, skip: number = 0) => {
        const response = await api.get<IAuditLog[]>(`/audit/logs?limit=${limit}&skip=${skip}`);
        return response.data;
    }
};
