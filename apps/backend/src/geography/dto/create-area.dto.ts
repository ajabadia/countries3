import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateAreaDto {
    @IsString()
    @IsNotEmpty()
    _id: string; // Manually provided ID (e.g., 'ES', 'FR')

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsObject()
    translations?: Record<string, string>;

    @IsOptional()
    @IsString()
    parent?: string;

    @IsOptional()
    @IsObject()
    data?: Record<string, any>;
}
