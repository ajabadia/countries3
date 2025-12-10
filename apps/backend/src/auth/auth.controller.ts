import { Controller, Request, Post, UseGuards, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req: any) {
        return this.authService.login(req.user);
    }

    @Post('register')
    async register(@Body() body: any) {
        return this.authService.register(body.username, body.password);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    getProfile(@Request() req: any) {
        return req.user;
    }
}
