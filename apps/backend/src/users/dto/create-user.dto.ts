import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    email!: string;

    @IsString()
    password!: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    role?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
