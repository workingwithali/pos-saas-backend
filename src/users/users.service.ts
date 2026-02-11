import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  // ======================
  // Create user (Register)
  // ======================
  async create(data: {
    email: string;
    password: string;
    role: string;
    tenantId: string;
  }) {
    return this.prisma.user.create({
      data,
    });
  }

  // ======================
  // Save hashed refresh token
  // ======================
  async updateRefreshToken(userId: string, refreshToken: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  // ======================
  // Remove refresh token (Logout)
  // ======================
  async removeRefreshToken(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }
}
