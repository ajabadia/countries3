export interface IAuditLog {
    _id: string;
    userId: string;
    action: string;
    resource: string;
    timestamp: Date;
    statusCode: number;
    method: string;
    path: string;
    ip?: string;
    metadata?: Record<string, any>;
}
