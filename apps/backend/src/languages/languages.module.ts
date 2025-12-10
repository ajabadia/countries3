import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';
import { LanguageSchema } from './schemas/language.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Language', schema: LanguageSchema }], 'world'),
    ],
    controllers: [LanguagesController],
    providers: [LanguagesService],
    exports: [LanguagesService],
})
export class LanguagesModule { }
