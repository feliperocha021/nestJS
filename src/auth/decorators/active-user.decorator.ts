import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { UserPayload } from '../interfaces/user-payload.interface';

export const ActiveUser = createParamDecorator(
  (field: keyof UserPayload | undefined, context: ExecutionContext) => {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const user: UserPayload = request.user;

    return field ? user?.[field] : user;
  },
);
