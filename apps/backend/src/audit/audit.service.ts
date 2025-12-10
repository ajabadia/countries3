import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from './schemas/audit-log.schema';

@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);

    constructor(
        @InjectModel('AuditLog', 'audit_db') private auditLogModel: Model<AuditLog>,
    ) { }

    async log(entry: {
        userId: string;
        action: string;
        resource: string;
        resourceId?: string;
        details?: any;
    }): Promise<void> {
        try {
            // Fire and forget - don't await to not block the main request
            const newLog = new this.auditLogModel(entry);
            newLog.save().catch((err) => {
                this.logger.error(`Failed to save audit log: ${err.message}`, err.stack);
            });
        } catch (error) {
            this.logger.error(`Failed to initiate audit log save: ${error.message}`);
        }
    }

    async findAll(limit: number = 50, skip: number = 0): Promise<AuditLog[]> {
        return this.auditLogModel.find().sort({ timestamp: -1 }).skip(skip).limit(limit).exec();
    }
}
