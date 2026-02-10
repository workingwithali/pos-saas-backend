import { Body, Controller, Get, HttpCode, HttpStatus, NotImplementedException, Post , UseGuards , Request  } from '@nestjs/common';

import { AuthService } from './auth.service';
import { GuardGuard } from './guard/guard.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Body() authInput: {username: string; password: string;}) {
        return this.authService.authenticate(authInput);
    }
    @UseGuards(GuardGuard)
    @Get('me')
    getUserInfo(@Request() request) {
        return request.user;
    }
    
}

