import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test', 'provision')
        .default('development'),
    PORT: Joi.number().default(3000),

    // MongoDB Connections
    MONGO_URI_WORLD: Joi.string().required().description('Connection string for World DB'),
    MONGO_URI_AUTH: Joi.string().required().description('Connection string for Auth DB'),
    MONGO_URI_AUDIT: Joi.string().required().description('Connection string for Audit DB'),
});
