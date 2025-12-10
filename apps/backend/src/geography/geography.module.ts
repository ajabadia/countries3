import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GeographyController } from './geography.controller';
import { GeographyService } from './geography.service';
import { AreaSchema } from './schemas/area.schema';
import { LanguageSchema } from './schemas/language.schema';

@Module({
    imports: [
        MongooseModule.forFeature(
            [
                { name: 'Area', schema: AreaSchema },
                { name: 'Language', schema: LanguageSchema },
            ],
            'world',
        ),
    ],
    controllers: [GeographyController],
    providers: [GeographyService],
    exports: [GeographyService],
})
export class GeographyModule { }
