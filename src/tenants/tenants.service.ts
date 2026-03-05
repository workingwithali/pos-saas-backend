import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { UpdateTenantDto } from "./dto/update-tenant.dto";

@Injectable()
export class TenantsService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateTenantDto) {
        return this.prisma.tenant.create({
            data: dto,
        });
    }

    async findAll() {
        return this.prisma.tenant.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
        });

        if (!tenant) {
            throw new NotFoundException(`Tenant with ID ${id} not found`);
        }

        return tenant;
    }

    async update(id: string, dto: UpdateTenantDto) {
        await this.findOne(id); // Ensure existence

        return this.prisma.tenant.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string) {
        await this.findOne(id); // Ensure existence

        return this.prisma.tenant.delete({
            where: { id },
        });
    }
}
