import { registerAs } from '@nestjs/config';

export interface S3Config {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export default registerAs<S3Config>('s3', () => ({
  region: process.env.AWS_REGION || 'us-east-2',
  bucket: process.env.S3_BUCKET || '',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
}));
