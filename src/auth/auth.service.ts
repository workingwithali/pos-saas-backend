import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  // ======================
  // Validate user (LocalStrategy)
  // ======================
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user;
    return result;
  }

  // ======================
  // Login
  // ======================
  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map(r => r.name),
      tenantId: user.tenantId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    // store hashed refresh token in DB
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  // ======================
  // Refresh Token
  // ======================
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new ForbiddenException('Invalid refresh token');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((r: any) => r.name),
      tenantId: user.tenantId,
    };

    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const newRefreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);

    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  // ======================
  // Logout
  // ======================
  async logout(userId: string) {
    await this.usersService.removeRefreshToken(userId);
    return { message: 'Logged out successfully' };
  }

  // ======================
  // Register User (optional)
  // ======================
  async register(dto: any) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      ...dto,
      password: hashedPassword,
    });

    return this.login(user);
  }
}
