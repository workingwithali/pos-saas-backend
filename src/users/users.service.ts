import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  // ======================
  // Find user by email
  // ======================
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // ======================
  // Find user by ID
  // ======================
  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  

  // ======================
  // Create user (Register)
  // ======================
  async create(data: {
  email: string;
  password: string;
  tenantId: string;
  name: string;
  role: "ADMIN"; // e.g., "ADMIN"
}) {
  return this.prisma.user.create({
    data: {
      email: data.email,
      password: data.password,
      tenantId: data.tenantId,
      name: data.name,
      role: data.role
    }
  });
}

}