import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { SubscriptionsService } from '../../../subscriptions/subscriptions.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private subscriptionsService: SubscriptionsService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.tenantId) {
      return false; // Or throw Unauthorized
    }

    const isValid = await this.subscriptionsService.checkSubscriptionStatus(user.tenantId);
    if (!isValid) {
      throw new ForbiddenException('Subscription expired or inactive');
    }

    return true;
  }
}
