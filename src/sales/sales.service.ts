import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateSaleDto } from "./dto/create-sale.dto";

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSaleDto, tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new Error(`Tenant with id ${tenantId} not found`);
    }

    let subtotal = 0;
    const itemsData: Array<{ productId: string; quantity: number; unitPrice: any; totalPrice: number }> = [];

    for (const item of dto.items) {
      const product = await this.prisma.product.findFirst({
        where: { id: item.productId, tenantId },
      });

      if (!product) {
        throw new Error(`Product with id ${item.productId} not found`);
      }

      const totalPrice = Number(product.price) * item.quantity;
      subtotal += totalPrice;

      itemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice,
      });

      await this.prisma.product.update({
        where: { id: product.id },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const discountAmount = subtotal * (dto.discountPercent / 100);
    const taxedAmount = (subtotal - discountAmount) * (tenant.taxRate / 100);
    const totalAmount = subtotal - discountAmount + taxedAmount;

    return this.prisma.sale.create({
      data: {
        invoiceNumber: `INV-${Date.now()}`,
        subtotal,
        totalAmount,
        taxAmount: taxedAmount,
        discountAmount,
        paymentMethod: dto.paymentMethod,
        tenantId,
        items: { create: itemsData },
      },
      include: { items: true },
    });
  }
}
