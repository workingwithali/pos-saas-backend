import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Create a category safely, checking for duplicates per tenant */
  async create(createCategoryDto: CreateCategoryDto, tenantId: string) {
    // Check if a category with the same name exists for this tenant
    const existingCategory = await this.prisma.category.findUnique({
      where: {
        tenantId_name: {
          tenantId,
          name: createCategoryDto.name,
        },
      },
    });

    if (existingCategory) {
      throw new ConflictException(
        `Category with name "${createCategoryDto.name}" already exists for this tenant.`,
      );
    }

    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        tenantId,
      },
    });
  }

  /** Fetch all categories for a tenant */
  async findAll(tenantId: string) {
    return this.prisma.category.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Fetch a single category, ensuring it belongs to the tenant */
  async findOne(id: string, tenantId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category || category.tenantId !== tenantId) {
      throw new NotFoundException(`Category with ID ${id} not found for this tenant.`);
    }

    return category;
  }

  /** Update a category safely, ensuring uniqueness per tenant */
  async update(id: string, updateCategoryDto: UpdateCategoryDto, tenantId: string) {
    const category = await this.findOne(id, tenantId);

    // If updating the name, check for uniqueness
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const conflictCategory = await this.prisma.category.findUnique({
        where: {
          tenantId_name: {
            tenantId,
            name: updateCategoryDto.name,
          },
        },
      });

      if (conflictCategory) {
        throw new ConflictException(
          `Category with name "${updateCategoryDto.name}" already exists for this tenant.`,
        );
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  /** Delete a category safely */
  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId); // Ensure it exists for the tenant
    return this.prisma.category.delete({
      where: { id },
    });
  }
}