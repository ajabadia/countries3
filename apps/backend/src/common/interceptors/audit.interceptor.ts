import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(private readonly auditService: AuditService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { method, url, user, body } = req;

        return next.handle().pipe(
            tap(() => {
                if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
                    this.auditService.log({
                        userId: user?.userId || 'anonymous',
                        action: method,
                        resource: url,
                        details: body,
                    });
                }
            }),
        );
    }
}
