import { Controller, Get, Param, UseGuards, Post, Body, Patch, Delete } from '@nestjs/common';
import { GeographyService } from './geography.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('geography')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GeographyController {
    constructor(private readonly geographyService: GeographyService) { }

    @Get('languages')
    getLanguages() {
        return this.geographyService.findAllLanguages();
    }

    @Get('areas')
    getAreas() {
        return this.geographyService.findAllAreas();
    }

    @Get('areas/roots')
    getRootAreas() {
        return this.geographyService.findRootAreas();
    }

    @Get('areas/:id')
    getArea(@Param('id') id: string) {
        return this.geographyService.findOneArea(id);
    }

    @Get('areas/:id/children')
    getChildren(@Param('id') id: string) {
        return this.geographyService.findChildren(id);
    }

    @Post('areas')
    @Roles('admin')
    createArea(@Body() createAreaDto: CreateAreaDto) {
        return this.geographyService.create(createAreaDto);
    }

    @Post('areas/bulk')
    @Roles('admin')
    createBulk(@Body() createAreaDtos: CreateAreaDto[]) {
        return this.geographyService.createBulk(createAreaDtos);
    }

    @Patch('areas/:id')
    @Roles('admin')
    updateArea(@Param('id') id: string, @Body() updateAreaDto: UpdateAreaDto) {
        return this.geographyService.update(id, updateAreaDto);
    }

    @Delete('areas/:id')
    @Roles('admin')
    removeArea(@Param('id') id: string) {
        return this.geographyService.remove(id);
    }
}
