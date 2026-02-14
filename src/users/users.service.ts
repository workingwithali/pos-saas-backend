import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  

  // ======================
  // Find user by ID
  // ======================
  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }



  

  // ======================
  // Update user profile
  // ======================
  async update(id: string, data: { name?: string; email?: string }) {
    return this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
      },
    });
  }
}