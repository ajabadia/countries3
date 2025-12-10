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
import { EmailService } from '../common/email.service';

@Module({
    imports: [
        UsersModule,
        PassportModule,
        MongooseModule.forFeature([
            { name: PasswordReset.name, schema: PasswordResetSchema, collection: 'password_resets' }
        ], 'auth_db'),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'secretKey',
                signOptions: { expiresIn: '60m' },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [AuthService, LocalStrategy, JwtStrategy, EmailService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
