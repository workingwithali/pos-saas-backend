import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { TenantGuard } from 'src/common/guards/tenant/tenant.guard';
import { SubscriptionGuard } from "src/common/guards/subscription/subscription.guard";
import { Tenant } from 'src/common/decorators/tenant.decorator/tenant.decorator';

@ApiTags('Dashboard')
@UseGuards(JwtAuthGuard, TenantGuard, SubscriptionGuard)
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('metrics')
    getMetrics(@Tenant() tenantId: string) {
        return this.dashboardService.getSalesMetrics(tenantId);
    }

    @Get('top-selling')
    getTopSelling(@Tenant() tenantId: string) {
        return this.dashboardService.getTopSelling(tenantId);
    }

    @Get('low-stock')
    getLowStock(@Tenant() tenantId: string) {
        return this.dashboardService.getLowStock(tenantId);
    }
}
