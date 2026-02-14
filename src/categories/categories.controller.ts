import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { TenantGuard } from 'src/common/guards/tenant/tenant.guard';
import { Tenant } from 'src/common/decorators/tenant.decorator/tenant.decorator';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, TenantGuard)
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    create(@Tenant() tenantId: string, @Body() createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.create(createCategoryDto, tenantId);
    }

    @Get()
    findAll(@Tenant() tenantId: string) {
        return this.categoriesService.findAll(tenantId);
    }

    @Get(':id')
    findOne(@Tenant() tenantId: string, @Param('id') id: string) {
        return this.categoriesService.findOne(id, tenantId);
    }

    @Patch(':id')
    update(@Tenant() tenantId: string, @Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
        return this.categoriesService.update(id, updateCategoryDto, tenantId);
    }

    @Delete(':id')
    remove(@Tenant() tenantId: string, @Param('id') id: string) {
        return this.categoriesService.remove(id, tenantId);
    }
}
