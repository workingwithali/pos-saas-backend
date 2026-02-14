import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getSalesMetrics(tenantId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [todaySales, totalRevenue, totalProducts] = await Promise.all([
            this.prisma.sale.aggregate({
                _sum: { totalAmount: true },
                where: {
                    tenantId,
                    createdAt: { gte: today },
                },
            }),
            this.prisma.sale.aggregate({
                _sum: { totalAmount: true },
                where: { tenantId },
            }),
            this.prisma.product.count({
                where: { tenantId },
            }),
        ]);

        return {
            todaySales: todaySales._sum.totalAmount || 0,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
            totalProducts,
        };
    }

    async getTopSelling(tenantId: string) {
        // Prisma doesn't support relation aggregation in groupBy easily for this structure
        // We'll group by productId in SaleItem
        const topItems = await this.prisma.saleItem.groupBy({
            by: ['productId'],
            _sum: { quantity: true },
            where: { sale: { tenantId } },
            orderBy: {
                _sum: { quantity: 'desc' },
            },
            take: 5,
        });

        const productIds = topItems.map((item) => item.productId);
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds }, tenantId },
            select: { id: true, name: true, price: true },
        });

        return topItems.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            return {
                productId: item.productId,
                name: product?.name || 'Unknown',
                price: product?.price || 0,
                totalSold: item._sum.quantity,
            };
        });
    }

    async getLowStock(tenantId: string) {
        // We can't compare two columns (stock <= lowStockThreshold) directly in Prisma where clause easily without raw query or separate check
        // Logic: fetch all products and filter, OR use raw query.
        // Given the task simplicity, let's fetch products where stock is low (e.g. < 10) or better:
        // Actually, prisma allows field comparison since recent versions? No, field reference only in specific cases.
        // Let's use raw query for efficiency or client side filter if list is small.
        // Let's try raw query for better performance.

        // precise filtering requires raw query or in-memory.
        // Let's use finding all and filtering for safety and type support if data size isn't huge, 
        // or raw query if we want to be efficient. 
        // Given it's a dashboard, we want efficient.

        return this.prisma.$queryRaw`
      SELECT id, name, sku, stock, "lowStockThreshold"
      FROM "Product"
      WHERE "tenantId" = ${tenantId}
      AND stock <= "lowStockThreshold"
    `;
    }
}
