import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { UsersService } from '../users/users.service';
import { getModelToken } from '@nestjs/mongoose';
import { RefreshToken } from './schemas/refresh-token.schema';
import { UnauthorizedException } from '@nestjs/common';

describe('TokenService', () => {
    let service: TokenService;

    const mockRefreshTokenModel = {
        create: jest.fn(),
        findOne: jest.fn(),
        updateOne: jest.fn(),
        updateMany: jest.fn(),
    };

    const mockUsersService = {
        findById: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TokenService,
                { provide: getModelToken(RefreshToken.name, 'auth_db'), useValue: mockRefreshTokenModel },
                { provide: UsersService, useValue: mockUsersService },
            ],
        }).compile();

        service = module.get<TokenService>(TokenService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('generateRefreshToken', () => {
        it('should create and return a refresh token', async () => {
            const userId = '507f1f77bcf86cd799439011';
            mockRefreshTokenModel.create.mockResolvedValue({});

            const token = await service.generateRefreshToken(userId);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.length).toBe(64); // 32 bytes hex = 64 characters
            expect(mockRefreshTokenModel.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId,
                    token: expect.any(String),
                    expiresAt: expect.any(Date),
                    revoked: false
                })
            );
        });
    });

    describe('validateRefreshToken', () => {
        const mockUser = {
            _id: '507f1f77bcf86cd799439011',
            username: 'testuser',
            email: 'test@example.com'
        };

        it('should return user when token is valid', async () => {
            const validToken = {
                userId: '507f1f77bcf86cd799439011',
                token: 'valid-token',
                expiresAt: new Date(Date.now() + 86400000), // +1 day
                revoked: false,
                exec: jest.fn().mockResolvedValue(this)
            };

            mockRefreshTokenModel.findOne.mockReturnValue(validToken);
            mockUsersService.findById.mockResolvedValue(mockUser);

            const result = await service.validateRefreshToken('valid-token');

            expect(result).toEqual(mockUser);
        });

        it('should throw UnauthorizedException when token not found', async () => {
            mockRefreshTokenModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null)
            });

            await expect(service.validateRefreshToken('invalid-token'))
                .rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException when token is revoked', async () => {
            const revokedToken = {
                userId: '507f1f77bcf86cd799439011',
                token: 'revoked-token',
                expiresAt: new Date(Date.now() + 86400000),
                revoked: true,
                exec: jest.fn().mockResolvedValue(this)
            };

            mockRefreshTokenModel.findOne.mockReturnValue(revokedToken);

            await expect(service.validateRefreshToken('revoked-token'))
                .rejects.toThrow('Refresh token has been revoked');
        });

        it('should throw UnauthorizedException when token is expired', async () => {
            const expiredToken = {
                userId: '507f1f77bcf86cd799439011',
                token: 'expired-token',
                expiresAt: new Date(Date.now() - 86400000), // -1 day
                revoked: false,
                exec: jest.fn().mockResolvedValue(this)
            };

            mockRefreshTokenModel.findOne.mockReturnValue(expiredToken);

            await expect(service.validateRefreshToken('expired-token'))
                .rejects.toThrow('Refresh token expired');
        });
    });

    describe('revokeRefreshToken', () => {
        it('should mark token as revoked', async () => {
            mockRefreshTokenModel.updateOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ modifiedCount: 1 })
            });

            await service.revokeRefreshToken('token-to-revoke');

            expect(mockRefreshTokenModel.updateOne).toHaveBeenCalledWith(
                { token: 'token-to-revoke' },
                { revoked: true }
            );
        });
    });

    describe('revokeAllUserTokens', () => {
        it('should revoke all tokens for a user', async () => {
            const userId = '507f1f77bcf86cd799439011';
            mockRefreshTokenModel.updateMany.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ modifiedCount: 3 })
            });

            await service.revokeAllUserTokens(userId);

            expect(mockRefreshTokenModel.updateMany).toHaveBeenCalledWith(
                { userId },
                { revoked: true }
            );
        });
    });
});
