import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop()
    firstName: string;

    @Prop()
    lastName: string;

    @Prop({ required: true })
    passwordHash: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: [String], default: ['user'] })
    roles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
