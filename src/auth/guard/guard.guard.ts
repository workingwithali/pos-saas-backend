import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class GuardGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext, ) {
    const request = context.switchToHttp().getRequest();
    const authizatioin = request.headers.authorization;
    const token = authizatioin?.split(' ')[1];
    if(!token ){
      throw new UnauthorizedException('No token provided');
    }
    try {
      const playload = await this.jwtService.verifyAsync(token);
      request.user = {
        id: playload.sub,
        username: playload.username,
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
