import * as Joi from 'joi';

export default Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  DB_PORT: Joi.number().port().default(5432),
  DB_PASSWORD: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  JWT_TOKEN_SECRET: Joi.string().required(),
});
