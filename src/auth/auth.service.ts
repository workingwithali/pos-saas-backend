import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signup(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.shopName,
          currency: dto.currency,
          taxRate: dto.taxRate,
        },
      });

      const user = await tx.user.create({
        data: {
          name: dto.OwnerName,
          email: dto.email,
          password: hashedPassword,
          role: 'ADMIN',
          tenantId: tenant.id,
        },
      });

      await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          plan: 'BASIC',
          isActive: true,
          expiresAt: new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000,
          ),
        },
      });

      const token = this.generateToken(user);

      return {
        accessToken: token,
      };
    });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException();

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException();

    const token = this.generateToken(user);

    return { accessToken: token };
  }

  private generateToken(user: any) {
    return this.jwt.sign({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
    });
  }
}
