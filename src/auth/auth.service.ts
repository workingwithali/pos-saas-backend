import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
type AuthInput = {
    username: string;
    password: string;
};
type SignInData = {
    userId: number;
    username: string;
};
type authResponse = {
    accessToken: string;
    userId: number;
    userName: string;
};

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }
    async authenticate(authInput: AuthInput): Promise<authResponse> {
        const user = await this.validateUser(authInput);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.signIn(user);
    }
    async validateUser(authInput: AuthInput): Promise<SignInData | null> {
        const user = await this.usersService.findOne(authInput.username);
        if (user.password !== authInput.password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return {
            userId: user.userId,
            username: user.username
        };
    }
    async signIn(user: SignInData): Promise<authResponse> {
        const playload = { username: user.username, sub: user.userId };
        const accessToken = await this.jwtService.signAsync(playload);
        return { accessToken, userId: user.userId, userName: user.username };
    }
}
