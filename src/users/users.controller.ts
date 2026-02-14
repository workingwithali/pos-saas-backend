import { Body, Controller, Get, Patch, UseGuards, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get('profile')
    async getProfile(@Request() req) {
        const user = await this.usersService.findById(req.user.userId);
        if (!user) {
            return null;
        }
        // Exclude password
        const { password, ...result } = user;
        return result;
    }

    @Patch('profile')
    async updateProfile(@Request() req, @Body() dto: UpdateUserDto) {
        const user = await this.usersService.update(req.user.userId, dto);
        const { password, ...result } = user;
        return result;
    }
}
