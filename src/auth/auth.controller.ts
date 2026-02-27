import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import express from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  signup(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: express.Response) {
    return this.authService.signup(dto, res);
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: express.Response) {
    return this.authService.login(dto, res);
  }

  @Post('refresh')
  async refresh(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
    const refreshToken = req.cookies.refreshToken;
    return this.authService.refreshTokens(refreshToken, res);
  }

  @Post('logout')
  async logout(@Req() req: express.Request, @Res() res: express.Response) {
    const refreshToken = req.cookies?.refreshToken;
    console.log("Cookies:", req.cookies);
    console.log("Headers:", req.headers.cookie);

    if (!refreshToken) {
      return res.status(200).json({ message: 'Already logged out' });
    }
    console.log('Received refresh token for logout:', refreshToken);
    await this.authService.logout(refreshToken, res);
    console.log('Refresh token invalidated, clearing cookie');
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });
    console.log('Refresh token cookie cleared');

    return res.json({ message: 'Logged out successfully' });
  }
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  me(@CurrentUser() user: any) {
    return user.name;
  }
}
