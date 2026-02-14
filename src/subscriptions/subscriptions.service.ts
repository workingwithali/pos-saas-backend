import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionPlan } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
    constructor(private prisma: PrismaService) { }

    async createSubscription(tenantId: string, plan: SubscriptionPlan) {
        const existingSub = await this.prisma.subscription.findFirst({
            where: { tenantId },
        });

        if (existingSub && existingSub.isActive) {
            // Option: Extending existing subscription
            // For simplicity: Update existing
            const newExpiresAt = new Date(existingSub.expiresAt);
            const days = plan === SubscriptionPlan.TRIAL ? 14 : 30; // Example duration
            newExpiresAt.setDate(newExpiresAt.getDate() + days);

            return this.prisma.subscription.update({
                where: { id: existingSub.id },
                data: {
                    plan,
                    expiresAt: newExpiresAt,
                    isActive: true,
                }
            });
        }

        // Create new
        const days = plan === SubscriptionPlan.TRIAL ? 14 : 30;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);

        return this.prisma.subscription.create({
            data: {
                tenantId,
                plan,
                isActive: true,
                expiresAt,
            },
        });
    }

    async checkSubscriptionStatus(tenantId: string) {
        const subscription = await this.prisma.subscription.findFirst({
            where: {
                tenantId,
                isActive: true,
                expiresAt: { gt: new Date() }, // Valid if expiration is in future
            },
        });

        return !!subscription;
    }
}
