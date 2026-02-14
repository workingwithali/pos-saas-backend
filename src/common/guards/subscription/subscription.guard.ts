import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const tenantId = req.user.tenantId;

    const sub = await this.prisma.subscription.findFirst({
      where: { tenantId },
    });

    if (!sub || !sub.isActive || sub.expiresAt < new Date()) {
      throw new ForbiddenException('Subscription expired');
    }

    return true;
  }
}
