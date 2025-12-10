import * as mongoose from 'mongoose';

export const AreaSchema = new mongoose.Schema({
    _id: { type: String },
    type: { type: String, required: true },
    name: { type: String, required: true },
    translations: { type: Object },
    hierarchy: {
        parent: { type: String, default: null },
        ancestors: [{ type: String }],
    },
    data: { type: Object, default: {} },
    active: { type: Boolean, default: true },
}, { collection: 'areas' });

export interface Area extends Omit<mongoose.Document, '_id'> {
    _id: string;
    type: string;
    name: string;
    translations: Record<string, string>;
    hierarchy: {
        parent: string | null;
        ancestors: string[];
    };
    data: Record<string, any>;
    active: boolean;
}
