import { CustomRequest } from '../interfaces/custom-request.interface';

export const cookieExtractor = (req: CustomRequest): string | null => {
  return typeof req.cookies.refreshToken === 'string'
    ? req.cookies.refreshToken
    : null;
};
