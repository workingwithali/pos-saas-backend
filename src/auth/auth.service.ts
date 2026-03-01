import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ================= SIGNUP =================
  async signup(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.shopName,
        currency: dto.currency,
        taxRate: dto.taxRate,
      },
    });

    const user = await this.prisma.user.create({
      data: {
        name: dto.OwnerName,
        email: dto.email,
        password: hashedPassword,
        role: 'ADMIN',
        tenantId: tenant.id,
      },
    });

    const trialExpiresAt = new Date();
    trialExpiresAt.setDate(trialExpiresAt.getDate() + 14);

    await this.prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        plan: 'TRIAL',
        isActive: true,
        expiresAt: trialExpiresAt,
      },
    });

    return this.generateTokens(user);
  }

  // ================= LOGIN =================
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user);
  }

  // ================= GENERATE TOKENS =================
  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    const hash = await bcrypt.hash(refreshToken, 10);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: hash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  // ================= REFRESH =================
  async refreshTokens(refreshToken: string) {
    if (!refreshToken) throw new ForbiddenException('Access denied');

    const decoded = await this.jwt.verifyAsync(refreshToken, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
    });

    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        userId: decoded.sub,
        expiresAt: { gt: new Date() },
      },
    });

    let matched: typeof tokens[number] | null = null;

    for (const token of tokens) {
      const isMatch = await bcrypt.compare(refreshToken, token.tokenHash);
      if (isMatch) {
        matched = token;
        break;
      }
    }

    if (!matched) throw new ForbiddenException('Access denied');

    // Rotate token
    await this.prisma.refreshToken.delete({
      where: { id: matched.id },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    return this.generateTokens(user);
  }

  // ================= LOGOUT =================
  async logout(refreshToken: string) {
    if (!refreshToken) return;
    console.log('Logout called with refreshToken:', refreshToken);

    const tokens = await this.prisma.refreshToken.findMany();

    for (const t of tokens) {
      const match = await bcrypt.compare(refreshToken, t.tokenHash);
      console.log(`Comparing token with ID ${t.id}: match=${match}`);
      if (match) {
        await this.prisma.refreshToken.delete({
          where: { id: t.id },
        });
        break;
      }
    }

    return { message: 'Logged out successfully' };
  }
}