import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SalesService } from "./sales.service";
import { JwtAuthGuard } from "src/common/guards/jwt-auth/jwt-auth.guard";
import { TenantGuard } from "src/common/guards/tenant/tenant.guard";
import { SubscriptionGuard } from "src/common/guards/subscription/subscription.guard";
import { CreateSaleDto } from "./dto/create-sale.dto";
import { Tenant } from "src/common/decorators/tenant.decorator/tenant.decorator";

@ApiTags('Sales')
@UseGuards(JwtAuthGuard, TenantGuard, SubscriptionGuard)
@Controller('sales')
export class SalesController {
    constructor(private service: SalesService) { }

    @Post()
    create(
        @Body() dto: CreateSaleDto,
        @Tenant() tenantId: string,
    ) {
        return this.service.create(dto, tenantId);
    }

    @Get()
    findAll(@Tenant() tenantId: string) {
        return this.service.findAll(tenantId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Tenant() tenantId: string) {
        return this.service.findOne(id, tenantId);
    }
}
