import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable, defer } from 'rxjs';
import { PrismaService } from './prisma.service';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId;

    if (!tenantId && request.route?.path !== '/auth/login') {
      throw new UnauthorizedException('Yêu cầu đăng nhập với tenant hợp lệ');
    }

    return defer(() =>
      this.prisma.runWithTenant(tenantId, () => next.handle()),
    );
  }
}