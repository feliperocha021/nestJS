import { registerAs } from '@nestjs/config';

export default registerAs('lambda', () => ({
  apiUrl: process.env.LAMBDA_API_URL!,
  apiKey: process.env.LAMBDA_API_KEY,
  timeoutMs: Number(process.env.LAMBDA_TIMEOUT_MS ?? 5000),
}));
