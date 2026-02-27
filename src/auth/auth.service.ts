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
import { Response } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ================= SIGNUP =================
  async signup(dto: RegisterDto, res: Response) {
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

    return this.issueTokens(user, res);
  }

  // ================= LOGIN =================
  async login(dto: LoginDto, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user, res);
  }

  // ================= REFRESH =================
  async refreshTokens(refreshToken: string, res: Response) {
    if (!refreshToken) throw new ForbiddenException('No refresh token');

    const tokenRecord = await this.prisma.refreshToken.findMany({
      where: {
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    const matched = await this.findMatchingToken(refreshToken, tokenRecord);

    if (!matched) throw new ForbiddenException('Access denied');

    // rotate token
    await this.prisma.refreshToken.delete({
      where: { id: matched.id },
    });

    return this.issueTokens(matched.user, res);
  }

  // ================= LOGOUT =================
  async logout(refreshToken: string, res: Response) {
    if (!refreshToken) return;
    console.log('Logout called with refresh token:', refreshToken);
    const tokens = await this.prisma.refreshToken.findMany();

    for (const t of tokens) {
      const match = await bcrypt.compare(refreshToken, t.tokenHash);
      console.log(`Comparing token ${t.id}:`, match);
      if (match) {
        await this.prisma.refreshToken.delete({ where: { id: t.id } });
        console.log(`Deleting token ${t.id}`);
        break;
      }
    }

    res.clearCookie('refreshToken');
    return { message: 'Logged out' };
  }

  // ================= TOKEN ISSUER =================
  private async issueTokens(user: any, res: Response) {
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, tenantId: user.tenantId, role: user.role ,},
      {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: '15m',
      },
    );

    const refreshToken = crypto.randomUUID();
    const hash = await bcrypt.hash(refreshToken, 10);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: hash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // true in prod
      path: '/auth/refresh',
    });

    return { accessToken };
  }

  // ================= HELPER =================
  private async findMatchingToken(refreshToken: string, tokens: any[]) {
    for (const token of tokens) {
      const isMatch = await bcrypt.compare(refreshToken, token.tokenHash);
      if (isMatch) return token;
    }
    return null;
  }
}