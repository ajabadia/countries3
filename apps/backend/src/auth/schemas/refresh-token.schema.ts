import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ collection: 'refresh_tokens', timestamps: true })
export class RefreshToken {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    token: string;

    @Prop({ required: true })
    expiresAt: Date;

    @Prop({ default: false })
    revoked: boolean;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
