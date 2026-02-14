import { Body, Controller, Get, Param, Post, UseGuards, Res } from "@nestjs/common";
import express from 'express';
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

    @Get(':id/invoice')
    async downloadInvoice(
        @Param('id') id: string,
        @Tenant() tenantId: string,
        @Res() res: express.Response,
    ) {
        const pdfBuffer = await this.service.generateInvoice(id, tenantId);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });

        res.end(pdfBuffer);
    }
}
