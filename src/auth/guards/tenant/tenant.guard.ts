// auth/guards/tenant.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenantId = request.headers['x-tenant-id']; // or from route param

    if (!tenantId || user.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied for this tenant');
    }
    return true;
  }
}
