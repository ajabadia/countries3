import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuditService } from './audit.service';

@Controller('audit')
@UseGuards(AuthGuard('jwt'))
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
