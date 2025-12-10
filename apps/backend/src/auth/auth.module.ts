import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { PasswordReset, PasswordResetSchema } from './schemas/password-reset.schema';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema';
import { EmailService } from '../common/email.service';
import { TokenService } from './token.service';

@Module({
    imports: [
        UsersModule,
        PassportModule,
        MongooseModule.forFeature([
            { name: PasswordReset.name, schema: PasswordResetSchema, collection: 'password_resets' },
            { name: RefreshToken.name, schema: RefreshTokenSchema, collection: 'refresh_tokens' }
        ], 'auth_db'),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'secretKey',
                signOptions: { expiresIn: '15m' }, // Short-lived access tokens
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [AuthService, LocalStrategy, JwtStrategy, EmailService, TokenService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
