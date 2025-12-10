import * as mongoose from 'mongoose';

export const LanguageSchema = new mongoose.Schema({
    _id: { type: String },
    name: { type: String, required: true },
    translations: { type: Object },
}, { collection: 'languages' });

export interface Language extends Omit<mongoose.Document, '_id'> {
    _id: string;
    name: string;
    translations: Record<string, string>;
}
