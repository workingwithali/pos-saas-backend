import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import express from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ======================
  // Register
  // ======================
  @Post('register')
  async register(@Body() dto: any) {
    return this.authService.register(dto);
  }

  // ======================
  // Login
  // ======================
  @Post('login')
  @UseGuards(AuthGuard('local'))
  @HttpCode(200)
  async login(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(req.user);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true, // true in production (https)
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { accessToken };
  }

  // ======================
  // Refresh Token
  // ======================
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      return { message: 'No refresh token' };
    }

    // decode token to get userId
    const payload: any = await this.authService['jwtService'].verify(
      refreshToken,
    );

    const tokens = await this.authService.refreshTokens(
      payload.sub,
      refreshToken,
    );

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: tokens.accessToken };
  }

  // ======================
  // Logout
  // ======================
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    await this.authService.logout(req.user.userId);

    res.clearCookie('refresh_token', { path: '/auth/refresh' });

    return { message: 'Logged out successfully' };
  }

  // ======================
  // Profile (test protected route)
  // ======================
  @UseGuards(JwtAuthGuard)
  @Post('profile')
  getProfile(@Req() req: any) {
    return req.user;
  }
}
