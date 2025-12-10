import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { PasswordReset, PasswordResetDocument } from './schemas/password-reset.schema';
import { EmailService } from '../common/email.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private emailService: EmailService,
        private tokenService: TokenService,
        @InjectModel(PasswordReset.name, 'auth_db') private passwordResetModel: Model<PasswordResetDocument>,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(username);
        if (user) {
            // Use bcryptjs to compare password
            const isValid = await bcrypt.compare(pass, user.passwordHash);
            if (isValid) {
                const { passwordHash, ...result } = user.toObject();
                return result;
            }
        }
        return null;
    }

    async login(user: any) {
        const payload = {
            username: user.username,
            sub: user._id,
            roles: user.roles || ['user']  // Include roles array for RBAC
        };

        // Generate refresh token
        const refreshToken = await this.tokenService.generateRefreshToken(user._id);

        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: refreshToken,
            user: {
                username: user.username,
                roles: user.roles || ['user']
            }
        };
    }

    async register(username: string, pass: string) {
        // Delegate hashing and creation to UsersService
        return this.usersService.create({
            email: username,
            password: pass,
            firstName: 'New',
            lastName: 'User',
            roles: ['user'],
            isActive: true
        });
    }

    /**
     * Request password reset - generates token and sends email
     */
    async requestPasswordReset(email: string): Promise<{ message: string }> {
        const user = await this.usersService.findOne(email);

        if (!user) {
            // Don't reveal if user exists or not (security best practice)
            return { message: 'If the email exists, a reset link has been sent.' };
        }

        // Generate cryptographically secure random token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Token expires in 1 hour
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        // Save reset token to database
        await this.passwordResetModel.create({
            userId: user._id.toString(),
            token: resetToken,
            expiresAt,
            used: false
        });

        // Send email with reset link
        await this.emailService.sendPasswordResetEmail(email, resetToken);

        return { message: 'If the email exists, a reset link has been sent.' };
    }

    /**
     * Validate reset token
     */
    async validateResetToken(token: string): Promise<{ valid: boolean; message?: string }> {
        const resetRecord = await this.passwordResetModel.findOne({ token }).exec();

        if (!resetRecord) {
            return { valid: false, message: 'Invalid reset token' };
        }

        if (resetRecord.used) {
            return { valid: false, message: 'Reset token already used' };
        }

        if (new Date() > resetRecord.expiresAt) {
            return { valid: false, message: 'Reset token expired' };
        }

        return { valid: true };
    }

    /**
     * Reset password using token
     */
    async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
        const resetRecord = await this.passwordResetModel.findOne({ token }).exec();

        if (!resetRecord) {
            throw new BadRequestException('Invalid reset token');
        }

        if (resetRecord.used) {
            throw new BadRequestException('Reset token already used');
        }

        if (new Date() > resetRecord.expiresAt) {
            throw new BadRequestException('Reset token expired');
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // Update user password
        await this.usersService.updatePassword(resetRecord.userId, passwordHash);

        // Mark token as used
        resetRecord.used = true;
        await resetRecord.save();

        return { message: 'Password reset successfully' };
    }
}
