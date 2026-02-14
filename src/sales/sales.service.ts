import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateSaleDto } from "./dto/create-sale.dto";

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateSaleDto, tenantId: string) {
    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        throw new NotFoundException(`Tenant with id ${tenantId} not found`);
      }

      let subtotal = 0;
      const itemsData: {
        productId: string;
        quantity: number;
        unitPrice: any; // Decimal
        totalPrice: number;
      }[] = [];

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || product.tenantId !== tenantId) {
          throw new NotFoundException(`Product with id ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
        }

        const totalPrice = Number(product.price) * item.quantity;
        subtotal += totalPrice;

        itemsData.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice,
        });

        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const discountAmount = subtotal * (dto.discountPercent / 100);
      const taxAmount = (subtotal - discountAmount) * (tenant.taxRate / 100);
      const totalAmount = subtotal - discountAmount + taxAmount;

      const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      return tx.sale.create({
        data: {
          invoiceNumber,
          subtotal,
          totalAmount,
          taxAmount,
          discountAmount,
          paymentMethod: dto.paymentMethod,
          tenantId,
          items: { create: itemsData },
        },
        include: { items: { include: { product: true } } },
      });
    });
  }

  findAll(tenantId: string) {
    return this.prisma.sale.findMany({
      where: { tenantId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });

    if (!sale || sale.tenantId !== tenantId) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    return sale;
  }
}
