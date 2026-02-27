import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(private readonly configService: ConfigService) {

        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => req?.cookies?.refreshToken,
            ]),
            secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
            passReqToCallback: true,
        });
    }

    async validate(req: Request & { cookies: any }, payload: any) {
        const refreshToken = req.cookies.refreshToken;
        return { ...payload, refreshToken };
    }
}