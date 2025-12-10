import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            connectionName: 'world',
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('MONGO_URI_WORLD'),
            }),
            inject: [ConfigService],
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            connectionName: 'auth_db',
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('MONGO_URI_AUTH'),
            }),
            inject: [ConfigService],
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            connectionName: 'audit_db',
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('MONGO_URI_AUDIT'),
            }),
            inject: [ConfigService],
        }),
    ],
    exports: [MongooseModule],
})
export class DatabaseModule { }
