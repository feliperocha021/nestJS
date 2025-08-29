import { Request } from 'express';

export interface CustomRequest extends Request {
  cookies: {
    refreshToken?: string;
  };
}
