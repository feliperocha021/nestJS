import * as Joi from 'joi';

export default Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production', ''),
  DB_PORT: Joi.number().port().default(5432),
  DB_PASSWORD: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  JWT_TOKEN_SECRET: Joi.string().required(),
  JWT_TOKEN_EXPIRESIN: Joi.number().required(),
  JWT_REFRESH_TOKEN_EXPIRESIN: Joi.number().required(),
  JWT_TOKEN_AUDIENCE: Joi.string().required(),
  JWT_TOKEN_ISSUER: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_INSIGHT_PORT: Joi.number().port().default(8001),
  REDIS_URL: Joi.string().required(),
  AWS_REGION: Joi.string().required(),
  S3_BUCKET: Joi.string().required(),
  LAMBDA_API_URL: Joi.string().uri().required(),
  LAMBDA_API_KEY: Joi.string().allow('', null), // opcional, caso você use authorizer diferente
  LAMBDA_TIMEOUT_MS: Joi.number().default(5000),
});
