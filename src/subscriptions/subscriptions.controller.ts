import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant/tenant.guard';
import { Tenant } from '../common/decorators/tenant.decorator/tenant.decorator';
import { SubscriptionPlan } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard, TenantGuard)
export class SubscriptionsController {
    constructor(private readonly subscriptionsService: SubscriptionsService) { }

    @Post('subscribe')
    async subscribe(@Tenant() tenantId: string, @Body() body: { plan: SubscriptionPlan }) {
        return this.subscriptionsService.createSubscription(tenantId, body.plan);
    }

    @Get('status')
    async getStatus(@Tenant() tenantId: string) {
        const isValid = await this.subscriptionsService.checkSubscriptionStatus(tenantId);
        return { active: isValid };
    }
}
