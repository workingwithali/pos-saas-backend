import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Create a Tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Acme Corp',
      domain: 'acme.local',
    },
  });

  // 2. Create Users
  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: 'Admin User',
      email: 'admin@acme.local',
      password: 'password123', // hash in real app
    },
  });

  // 3. Create a Branch
  const branch = await prisma.branch.create({
    data: {
      tenantId: tenant.id,
      name: 'Main Branch',
      location: 'City Center',
    },
  });

  // 4. Create Products
  const product1 = await prisma.product.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      name: 'Sample Product 1',
      price: 50,
      stock: 100,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      name: 'Sample Product 2',
      price: 75,
      stock: 50,
    },
  });

  // 5. Create Customers
  const customer = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
    },
  });

  // 6. Create Suppliers
  const supplier = await prisma.supplier.create({
    data: {
      tenantId: tenant.id,
      name: 'Supplier A',
      email: 'supplier@example.com',
    },
  });

  console.log('Dummy data seeded successfully!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
