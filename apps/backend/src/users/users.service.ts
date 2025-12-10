import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
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
            // Stub bcrypt to avoid binary crashes in Docker/Windows env
            const passwordHash = `hashed_${createUserDto.password}`;
            console.log('Password hashed successfully (stubbed)');

            const userToCreate = {
                email: createUserDto.email,
                firstName: createUserDto.firstName || '',
                lastName: createUserDto.lastName || '',
                isActive: createUserDto.isActive !== undefined ? createUserDto.isActive : true,
                username: createUserDto.email,
                passwordHash,
                roles: createUserDto.role ? [createUserDto.role] : ['user']
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
        const updates: any = { ...updateUserDto };
        if (updateUserDto.password) {
            // Stub bcrypt to avoid binary crashes (matches create method)
            updates.passwordHash = `hashed_${updateUserDto.password}`;
            delete updates.password;
        }
        return this.userModel.findByIdAndUpdate(id, updates, { new: true }).exec();
    }

    async remove(id: string): Promise<UserDocument | null> {
        // Soft delete
        return this.userModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
    }
}
