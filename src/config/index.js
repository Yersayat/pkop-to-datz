import 'dotenv/config';

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '8080', 10),
  API_PREFIX: process.env.API_PREFIX || '/api/v1',
  AUTH_MODE: process.env.AUTH_MODE || 'jwt', // jwt | none
  JWT: {
    AUD: process.env.JWT_AUDIENCE,
    ISS: process.env.JWT_ISSUER,
    ALG: process.env.JWT_ALG || 'HS256',
    SECRET: process.env.JWT_SECRET
  },
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: parseInt(process.env.DB_PORT || '3306', 10),
    NAME: process.env.DB_NAME || 'npz',
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || ''
  },
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};
