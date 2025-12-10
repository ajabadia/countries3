import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditService } from './audit.service';
import { AuditLogSchema } from './schemas/audit-log.schema';

import { AuditController } from './audit.controller';

@Global() // Global so AuditInterceptor can use it without imports everywhere
@Module({
    imports: [
        MongooseModule.forFeature(
            [{ name: 'AuditLog', schema: AuditLogSchema }],
            'audit_db',
        ),
    ],
    controllers: [AuditController],
    providers: [AuditService],
    exports: [AuditService],
})
export class AuditModule { }
