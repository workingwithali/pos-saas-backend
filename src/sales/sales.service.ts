import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import PDFDocument from 'pdfkit';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateSaleDto, tenantId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verify Tenant
      const tenant = await tx.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        throw new NotFoundException(`Tenant with id ${tenantId} not found`);
      }

      let subtotal = 0;
      const itemsData: Array<{ productId: string; quantity: number; unitPrice: any; totalPrice: number }> = [];

      // 2. Process Items & Check Stock
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

        // Decrement Stock
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 3. Calculate Totals
      const discountAmount = subtotal * (dto.discountPercent / 100);
      const taxAmount = (subtotal - discountAmount) * (tenant.taxRate / 100);
      const totalAmount = subtotal - discountAmount + taxAmount;

      // 4. Generate Invoice Number
      const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // 5. Create Sale Record
      return tx.sale.create({
        data: {
          invoiceNumber,
          subtotal,
          totalAmount,
          taxAmount,
          discountAmount,
          paymentMethod: dto.paymentMethod,
          tenantId,
          items: {
            create: itemsData,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  }

  findAll(tenantId: string) {
    return this.prisma.sale.findMany({
      where: { tenantId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        tenant: true, // Include tenant for invoice details
      },
    });

    if (!sale || sale.tenantId !== tenantId) {
      throw new NotFoundException(`Sale with id ${id} not found`);
    }

    return sale;
  }

  async generateInvoice(saleId: string, tenantId: string): Promise<Buffer> {
    const sale = await this.findOne(saleId, tenantId);

    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(20).text(sale.tenant.name, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Invoice Number: ${sale.invoiceNumber}`);
      doc.text(`Date: ${sale.createdAt.toLocaleDateString()}`);
      doc.moveDown();

      // Table Header
      const tableTop = 150;
      doc.font('Helvetica-Bold');
      doc.text('Item', 50, tableTop);
      doc.text('Qty', 250, tableTop);
      doc.text('Price', 350, tableTop, { width: 90, align: 'right' });
      doc.text('Total', 450, tableTop, { width: 90, align: 'right' });
      doc.moveDown();
      doc.font('Helvetica');

      // Invalidating previous row positions logic for simplicity
      let y = tableTop + 25;

      sale.items.forEach((item) => {
        doc.text(item.product.name, 50, y);
        doc.text(item.quantity.toString(), 250, y);
        doc.text(Number(item.unitPrice).toFixed(2), 350, y, { width: 90, align: 'right' });
        doc.text(Number(item.totalPrice).toFixed(2), 450, y, { width: 90, align: 'right' });
        y += 20;
      });

      doc.moveDown();
      y += 20;

      // Totals
      doc.font('Helvetica-Bold');
      doc.text(`Subtotal: ${Number(sale.subtotal).toFixed(2)}`, 350, y, { align: 'right' });
      y += 20;
      doc.text(`Discount: -${Number(sale.discountAmount).toFixed(2)}`, 350, y, { align: 'right' });
      y += 20;
      doc.text(`Tax: ${Number(sale.taxAmount).toFixed(2)}`, 350, y, { align: 'right' });
      y += 20;
      doc.fontSize(14).text(`Total: ${Number(sale.totalAmount).toFixed(2)}`, 350, y, { align: 'right' });

      doc.end();
    });
  }
}
