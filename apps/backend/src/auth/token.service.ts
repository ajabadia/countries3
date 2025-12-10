import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { RefreshToken, RefreshTokenDocument } from './schemas/refresh-token.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class TokenService {
    constructor(
        @InjectModel(RefreshToken.name, 'auth_db') private refreshTokenModel: Model<RefreshTokenDocument>,
        private usersService: UsersService,
    ) { }

    /**
     * Generate and store a new refresh token
     */
    async generateRefreshToken(userId: string): Promise<string> {
        const token = crypto.randomBytes(32).toString('hex');

        // Refresh tokens expire in 7 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await this.refreshTokenModel.create({
            userId,
            token,
            expiresAt,
            revoked: false
        });

        return token;
    }

    /**
     * Validate refresh token and return user
     */
    async validateRefreshToken(token: string): Promise<any> {
        const refreshToken = await this.refreshTokenModel.findOne({ token }).exec();

        if (!refreshToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (refreshToken.revoked) {
            throw new UnauthorizedException('Refresh token has been revoked');
        }

        if (new Date() > refreshToken.expiresAt) {
            throw new UnauthorizedException('Refresh token expired');
        }

        // Get user
        const user = await this.usersService.findById(refreshToken.userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return user;
    }

    /**
     * Revoke a specific refresh token
     */
    async revokeRefreshToken(token: string): Promise<void> {
        await this.refreshTokenModel.updateOne(
            { token },
            { revoked: true }
        ).exec();
    }

    /**
     * Revoke all refresh tokens for a user
     */
    async revokeAllUserTokens(userId: string): Promise<void> {
        await this.refreshTokenModel.updateMany(
            { userId },
            { revoked: true }
        ).exec();
    }
}
