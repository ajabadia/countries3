import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PasswordResetDocument = PasswordReset & Document;

@Schema({ collection: 'password_resets', timestamps: true })
export class PasswordReset {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    token: string;

    @Prop({ required: true })
    expiresAt: Date;

    @Prop({ default: false })
    used: boolean;
}

export const PasswordResetSchema = SchemaFactory.createForClass(PasswordReset);
