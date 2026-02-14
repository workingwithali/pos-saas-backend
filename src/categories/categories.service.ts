import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createCategoryDto: CreateCategoryDto, tenantId: string) {
        return this.prisma.category.create({
            data: {
                ...createCategoryDto,
                tenantId,
            },
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.category.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, tenantId: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
        });

        if (!category || category.tenantId !== tenantId) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return category;
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto, tenantId: string) {
        await this.findOne(id, tenantId); // Check existence

        return this.prisma.category.update({
            where: { id },
            data: updateCategoryDto,
        });
    }

    async remove(id: string, tenantId: string) {
        await this.findOne(id, tenantId); // Check existence

        return this.prisma.category.delete({
            where: { id },
        });
    }
}
