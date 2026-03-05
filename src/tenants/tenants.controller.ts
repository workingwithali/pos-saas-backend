import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TenantsService } from "./tenants.service";
import { JwtAuthGuard } from "src/common/guards/jwt-auth/jwt-auth.guard";
import { TenantGuard } from "src/common/guards/tenant/tenant.guard";
import { Tenant } from "src/common/decorators/tenant.decorator/tenant.decorator";
import { UpdateTenantDto } from "./dto/update-tenant.dto";

@ApiTags('Tenants')
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('tenants')
export class TenantsController {
    constructor(private service: TenantsService) { }

    @Get('me')
    getMe(@Tenant() tenantId: string) {
        return this.service.findOne(tenantId);
    }

    @Patch('me')
    updateMe(
        @Tenant() tenantId: string,
        @Body() dto: UpdateTenantDto,
    ) {
        return this.service.update(tenantId, dto);
    }
}
