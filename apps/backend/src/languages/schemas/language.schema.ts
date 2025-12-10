import * as mongoose from 'mongoose';

// Using Raw Mongoose Schema to avoid issues with custom _id (Lesson Learned #1)
export const LanguageSchema = new mongoose.Schema({
    _id: { type: String }, // ISO 639 code
    name: { type: String, required: true },
    nativeName: { type: String, default: null },
    active: { type: Boolean, default: true },
    translations: { type: Object, default: {} },
}, { collection: 'languages' });

export interface Language extends Omit<mongoose.Document, '_id'> {
    _id: string;
    name: string;
    nativeName: string | null;
    active: boolean;
    translations: Record<string, string>;
}
