import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { JwtStrategy } from './jwt.strategy/jwt.strategy';
import { LocalStrategy } from './local.strategy/local.strategy';

import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from './guards/roles/roles.guard';
import { TenantGuard } from './guards/tenant/tenant.guard';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,

    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '15m', // access token lifetime
      },
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,

    JwtAuthGuard,
    RolesGuard,
    TenantGuard,
  ],

  exports: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    TenantGuard,
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}
