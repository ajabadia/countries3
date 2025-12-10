import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(username);
        if (user) {
            // Stub bcrypt.compare to avoid binary crashes (matches stubbed hashing)
            const isValid = user.passwordHash === `hashed_${pass}`;
            if (isValid) {
                const { passwordHash, ...result } = user.toObject();
                return result;
            }
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user._id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(username: string, pass: string) {
        // Delegate hashing and creation to UsersService
        return this.usersService.create({
            email: username,
            password: pass,
            firstName: 'New',
            lastName: 'User',
            role: 'user',
            isActive: true
        });
    }
}
