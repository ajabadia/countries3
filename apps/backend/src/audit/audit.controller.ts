import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @Get('logs')
    async getLogs(
        @Query('limit') limit?: number,
        @Query('skip') skip?: number
    ) {
        return this.auditService.findAll(Number(limit) || 50, Number(skip) || 0);
    }
}
