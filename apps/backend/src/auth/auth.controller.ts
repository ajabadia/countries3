import { Controller, Request, Post, UseGuards, Body, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private tokenService: TokenService,
        private jwtService: JwtService,
    ) { }

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

    @Post('forgot-password')
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.requestPasswordReset(dto.email);
    }

    @Post('reset-password')
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto.token, dto.newPassword);
    }

    @Get('validate-reset-token/:token')
    async validateResetToken(@Param('token') token: string) {
        return this.authService.validateResetToken(token);
    }

    @Post('refresh')
    async refresh(@Body() dto: RefreshTokenDto) {
        const user = await this.tokenService.validateRefreshToken(dto.refresh_token);
        const payload = {
            username: user.username,
            sub: user._id,
            roles: user.roles || ['user']
        };
        const newAccessToken = this.jwtService.sign(payload);
        return { access_token: newAccessToken };
    }

    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    async logout(@Body() dto: LogoutDto) {
        await this.tokenService.revokeRefreshToken(dto.refresh_token);
        return { message: 'Logged out successfully' };
    }
}
