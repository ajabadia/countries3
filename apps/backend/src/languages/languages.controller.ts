import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('languages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LanguagesController {
    constructor(private readonly languagesService: LanguagesService) { }

    @Post()
    @Roles('admin')
    create(@Body() createLanguageDto: CreateLanguageDto) {
        return this.languagesService.create(createLanguageDto);
    }

    @Get()
    findAll(@Query('active') active?: string) {
        const activeOnly = active === 'true';
        return this.languagesService.findAll(activeOnly);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.languagesService.findOne(id);
    }

    @Patch(':id')
    @Roles('admin')
    update(@Param('id') id: string, @Body() updateLanguageDto: UpdateLanguageDto) {
        return this.languagesService.update(id, updateLanguageDto);
    }

    @Delete(':id')
    @Roles('admin')
    remove(@Param('id') id: string) {
        return this.languagesService.remove(id);
    }
}
