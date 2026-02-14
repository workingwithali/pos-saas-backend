import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';

@Module({
    imports: [PrismaModule, SubscriptionsModule],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }
