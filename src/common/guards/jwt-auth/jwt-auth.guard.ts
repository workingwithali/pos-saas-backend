// auth/guards/jwt-auth.guard.ts
import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
// jwt-auth.guard.ts
export class JwtAuthGuard extends AuthGuard('jwt') {}

// refresh-auth.guard.ts
export class RefreshAuthGuard extends AuthGuard('jwt-refresh') {}