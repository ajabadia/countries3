import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name, 'auth_db') private userModel: Model<UserDocument>,
    ) { }

    async findOne(username: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ username }).exec();
    }

    async findById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec();
    }

    async findAll(): Promise<UserDocument[]> {
        return this.userModel.find().exec();
    }

    async create(createUserDto: CreateUserDto): Promise<UserDocument> {
        console.log('Creating user with DTO:', JSON.stringify(createUserDto));

        // Validate required fields
        if (!createUserDto.email || !createUserDto.password) {
            const error = `Email and password are required. Received: ${JSON.stringify(createUserDto)}`;
            console.error(error);
            throw new Error(error);
        }

        try {
            // Hash password with bcryptjs (salt rounds = 10)
            const passwordHash = await bcrypt.hash(createUserDto.password, 10);
            console.log('Password hashed successfully with bcryptjs');

            const userToCreate = {
                email: createUserDto.email,
                firstName: createUserDto.firstName || '',
                lastName: createUserDto.lastName || '',
                isActive: createUserDto.isActive !== undefined ? createUserDto.isActive : true,
                username: createUserDto.email,
                passwordHash,
                roles: createUserDto.roles || ['user']  // Use roles array from DTO
            };
            console.log('User object prepared:', JSON.stringify(userToCreate));

            const createdUser = await this.userModel.create(userToCreate);
            console.log('User created in DB:', createdUser._id);
            return createdUser;
        } catch (error) {
            console.error('Error creating user:', error.message || error);
            throw error;
        }
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument | null> {
        console.log('🔧 UPDATE - Received DTO:', JSON.stringify(updateUserDto, null, 2));
        const updates: any = { ...updateUserDto };
        if (updateUserDto.password) {
            // Hash password with bcryptjs (salt rounds = 10)
            updates.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
            delete updates.password;
        }
        console.log('🔧 UPDATE - Final updates object:', JSON.stringify(updates, null, 2));
        const result = await this.userModel.findByIdAndUpdate(id, updates, { new: true }).exec();
        console.log('🔧 UPDATE - Result roles:', result?.roles);
        return result;
    }

    async remove(id: string): Promise<UserDocument | null> {
        // Soft delete
        return this.userModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
    }

    async updatePassword(userId: string, passwordHash: string): Promise<UserDocument | null> {
        return this.userModel.findByIdAndUpdate(userId, { passwordHash }, { new: true }).exec();
    }
}
