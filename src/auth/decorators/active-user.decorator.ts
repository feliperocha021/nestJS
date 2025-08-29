import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { AccessTokenPayload } from '../interfaces/user-payload.interface';

export const ActiveUser = createParamDecorator(
  (field: keyof AccessTokenPayload | undefined, context: ExecutionContext) => {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const user: AccessTokenPayload = request.user;

    return field ? user?.[field] : user;
  },
);
