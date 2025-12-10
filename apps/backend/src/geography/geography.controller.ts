import { Controller, Get, Param, UseGuards, Post, Body, Patch, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GeographyService } from './geography.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Controller('geography')
export class GeographyController {
    constructor(private readonly geographyService: GeographyService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('languages')
    getLanguages() {
        return this.geographyService.findAllLanguages();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('areas')
    getAreas() {
        return this.geographyService.findAllAreas();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('areas/roots')
    getRootAreas() {
        return this.geographyService.findRootAreas();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('areas/:id')
    getArea(@Param('id') id: string) {
        return this.geographyService.findOneArea(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('areas/:id/children')
    getChildren(@Param('id') id: string) {
        return this.geographyService.findChildren(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('areas')
    createArea(@Body() createAreaDto: CreateAreaDto) {
        return this.geographyService.create(createAreaDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('areas/bulk')
    createBulk(@Body() createAreaDtos: CreateAreaDto[]) {
        return this.geographyService.createBulk(createAreaDtos);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('areas/:id')
    updateArea(@Param('id') id: string, @Body() updateAreaDto: UpdateAreaDto) {
        return this.geographyService.update(id, updateAreaDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('areas/:id')
    removeArea(@Param('id') id: string) {
        return this.geographyService.remove(id);
    }
}
