import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { Language } from './schemas/language.schema';

@Injectable()
export class LanguagesService {
    constructor(
        @InjectModel('Language', 'world') private languageModel: Model<Language>,
    ) { }

    async findAll(activeOnly?: boolean): Promise<Language[]> {
        const filter = activeOnly ? { active: { $ne: false } } : {}; // Lesson Learned #3: Hybrid data filter
        return this.languageModel.find(filter).exec();
    }

    async findOne(id: string): Promise<Language | null> {
        return this.languageModel.findById(id).exec();
    }

    async create(createLanguageDto: CreateLanguageDto): Promise<Language> {
        const createdLanguage = new this.languageModel(createLanguageDto);
        return createdLanguage.save();
    }

    async update(id: string, updateLanguageDto: UpdateLanguageDto): Promise<Language | null> {
        return this.languageModel.findByIdAndUpdate(id, updateLanguageDto, { new: true }).exec();
    }

    async remove(id: string): Promise<Language | null> {
        // Soft delete
        return this.languageModel.findByIdAndUpdate(id, { active: false }, { new: true }).exec();
    }
}
