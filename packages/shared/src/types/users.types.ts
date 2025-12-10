export interface IUser {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export class CreateUserDto {
    email!: string;
    password!: string;
    firstName!: string;
    lastName!: string;
    role?: string;
    isActive?: boolean;
}

export class UpdateUserDto {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    isActive?: boolean;
}
