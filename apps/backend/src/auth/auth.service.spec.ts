import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { PasswordReset } from './schemas/password-reset.schema';
import { EmailService } from '../common/email.service';
import { TokenService } from './token.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
    let service: AuthService;
    let usersService: UsersService;
    let jwtService: JwtService;

    const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz', // bcrypt hash
        roles: ['user'],
        toObject: () => ({
            _id: '507f1f77bcf86cd799439011',
            username: 'testuser',
            email: 'test@example.com',
            roles: ['user']
        })
    };

    const mockPasswordResetModel = {
        create: jest.fn(),
        findOne: jest.fn(),
    };

    const mockUsersService = {
        findOne: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn().mockReturnValue('mock.jwt.token'),
    };

    const mockEmailService = {
        sendPasswordResetEmail: jest.fn(),
    };

    const mockTokenService = {
        generateRefreshToken: jest.fn().mockResolvedValue('mock-refresh-token'),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: mockUsersService },
                { provide: JwtService, useValue: mockJwtService },
                { provide: getModelToken(PasswordReset.name, 'auth_db'), useValue: mockPasswordResetModel },
                { provide: EmailService, useValue: mockEmailService },
                { provide: TokenService, useValue: mockTokenService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('validateUser', () => {
        it('should return user without password when credentials are valid', async () => {
            mockUsersService.findOne.mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

            const result = await service.validateUser('testuser', 'password123');

            expect(result).toBeDefined();
            expect(result.username).toBe('testuser');
            expect(result.passwordHash).toBeUndefined();
        });

        it('should return null when user not found', async () => {
            mockUsersService.findOne.mockResolvedValue(null);

            const result = await service.validateUser('nonexistent', 'password123');

            expect(result).toBeNull();
        });

        it('should return null when password is incorrect', async () => {
            mockUsersService.findOne.mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

            const result = await service.validateUser('testuser', 'wrongpassword');

            expect(result).toBeNull();
        });
    });

    describe('login', () => {
        it('should return access token and refresh token', async () => {
            const user = {
                _id: '507f1f77bcf86cd799439011',
                username: 'testuser',
                roles: ['user']
            };

            const result = await service.login(user);

            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('refresh_token');
            expect(result).toHaveProperty('user');
            expect(result.access_token).toBe('mock.jwt.token');
            expect(result.refresh_token).toBe('mock-refresh-token');
            expect(mockJwtService.sign).toHaveBeenCalledWith({
                username: 'testuser',
                sub: '507f1f77bcf86cd799439011',
                roles: ['user']
            });
        });
    });

    describe('requestPasswordReset', () => {
        it('should create reset token and send email when user exists', async () => {
            mockUsersService.findOne.mockResolvedValue(mockUser);
            mockPasswordResetModel.create.mockResolvedValue({});

            const result = await service.requestPasswordReset('test@example.com');

            expect(result.message).toContain('reset link has been sent');
            expect(mockPasswordResetModel.create).toHaveBeenCalled();
            expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalled();
        });

        it('should return generic message when user not found (security)', async () => {
            mockUsersService.findOne.mockResolvedValue(null);

            const result = await service.requestPasswordReset('nonexistent@example.com');

            expect(result.message).toContain('reset link has been sent');
            expect(mockPasswordResetModel.create).not.toHaveBeenCalled();
        });
    });
});
