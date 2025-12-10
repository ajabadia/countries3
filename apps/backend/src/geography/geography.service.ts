import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Area } from './schemas/area.schema';
import { Language } from './schemas/language.schema';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Injectable()
export class GeographyService {
    constructor(
        @InjectModel('Area', 'world') private areaModel: Model<Area>,
        @InjectModel('Language', 'world') private languageModel: Model<Language>,
    ) { }

    async findAllLanguages(): Promise<Language[]> {
        return this.languageModel.find().exec();
    }

    async findAllAreas(): Promise<Area[]> {
        return this.areaModel.find({ active: { $ne: false } }).exec();
    }

    async findOneArea(id: string): Promise<Area | null> {
        return this.areaModel.findById(id).exec();
    }

    async findRootAreas(): Promise<Area[]> {
        return this.areaModel.find({ 'hierarchy.parent': null, active: { $ne: false } }).exec();
    }

    async findChildren(parentId: string): Promise<Area[]> {
        return this.areaModel.find({ 'hierarchy.parent': parentId, active: { $ne: false } }).exec();
    }

    async create(createAreaDto: CreateAreaDto): Promise<Area> {
        // Logic: Ancestors calculation
        let ancestors: string[] = [];
        if (createAreaDto.parent) {
            const parentArea = await this.areaModel.findById(createAreaDto.parent).exec();
            if (!parentArea) {
                throw new NotFoundException(`Parent area ${createAreaDto.parent} not found`);
            }
            ancestors = [...(parentArea.hierarchy.ancestors || []), parentArea._id];
        }

        const newArea = new this.areaModel({
            ...createAreaDto,
            hierarchy: {
                parent: createAreaDto.parent || null,
                ancestors: ancestors,
            }
        });

        return newArea.save();
    }

    async update(id: string, updateAreaDto: UpdateAreaDto): Promise<Area | null> {
        // If parent is changing, we should recalculate ancestors. 
        // For simplicity in this phase, we warn or defer complex cascading updates.
        // However, we MUST recalculate for this node.
        let updateData: any = { ...updateAreaDto };

        if (updateAreaDto.parent !== undefined) {
            const newParentId = updateAreaDto.parent;
            let newAncestors: string[] = [];

            // Circular Dependency Check
            if (newParentId) {
                if (newParentId === id) {
                    throw new BadRequestException('Cannot set area as its own parent');
                }

                const parentArea = await this.areaModel.findById(newParentId).exec();
                if (!parentArea) {
                    throw new NotFoundException(`Parent area ${newParentId} not found`);
                }

                // Check if current ID is an ancestor of the new parent (Cycle)
                if (parentArea.hierarchy.ancestors?.includes(id)) {
                    throw new BadRequestException(`Circular dependency detected: ${newParentId} is a descendant of ${id}`);
                }

                newAncestors = [...(parentArea.hierarchy.ancestors || []), parentArea._id];
            } else {
                // Moving to root
                newAncestors = [];
            }

            updateData.hierarchy = {
                parent: newParentId,
                ancestors: newAncestors
            };

            // TODO: Implement LOW PRIORITY Cascade Update for children
        }

        return this.areaModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    }

    async remove(id: string): Promise<Area | null> {
        // Soft Delete Check: Has active children?
        const hasChildren = await this.areaModel.exists({ 'hierarchy.parent': id, active: { $ne: false } });
        if (hasChildren) {
            throw new BadRequestException('Cannot remove area with active children');
        }

        return this.areaModel.findByIdAndUpdate(id, { active: false }, { new: true }).exec();
    }

    async createBulk(createAreaDtos: CreateAreaDto[]): Promise<Area[]> {
        const createdAreas: Area[] = [];
        for (const dto of createAreaDtos) {
            const area = await this.create(dto);
            createdAreas.push(area);
        }
        return createdAreas;
    }
}
