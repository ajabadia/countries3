import * as mongoose from 'mongoose';

export const AuditLogSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true }, // e.g. 'areas', 'users'
    resourceId: { type: String },
    details: { type: Object },
    timestamp: { type: Date, default: Date.now, index: { expires: '365d' } }, // TTL Index 1 year
}, { collection: 'audit_logs' });

export interface AuditLog extends mongoose.Document {
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    details: any;
    timestamp: Date;
}
