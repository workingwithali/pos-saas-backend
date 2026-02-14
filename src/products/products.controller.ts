import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { JwtAuthGuard } from "src/common/guards/jwt-auth/jwt-auth.guard";
import { TenantGuard } from "src/common/guards/tenant/tenant.guard";
import { CreateProductDto } from "./dto/create-product.dto";
import { Tenant } from "src/common/decorators/tenant.decorator/tenant.decorator";

@ApiTags('Products')
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('products')
export class ProductsController {
  constructor(private service: ProductsService) {}

  @Post()
  create(
    @Body() dto: CreateProductDto,
    @Tenant() tenantId: string,
  ) {
    return this.service.create(dto, tenantId);
  }

  @Get()
  findAll(@Tenant() tenantId: string) {
    return this.service.findAll(tenantId);
  }
}
