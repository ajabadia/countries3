import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsString({ each: true })
    roles?: string[];

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
