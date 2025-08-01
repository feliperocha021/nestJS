import { Request } from 'express';
import { AccessTokenPayload } from './user-payload.interface';

export interface AuthenticatedRequest extends Request {
  user: AccessTokenPayload;
}
