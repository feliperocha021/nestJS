import { ApiResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/error-response.dto';

export function ApiBadRequestError(description = 'Bad Request') {
  return ApiResponse({
    status: 400,
    description,
    type: ErrorResponseDto,
    examples: {
      generic: {
        summary: 'Validation error',
        value: {
          statusCode: 400,
          message: ['Invalid input data'],
          error: 'Bad Request',
          timestamp: '2025-10-23T17:00:00.000Z',
          path: '/resource',
        },
      },
    },
  });
}

export function ApiUnauthorizedError(description = 'Unauthorized') {
  return ApiResponse({
    status: 401,
    description,
    type: ErrorResponseDto,
    examples: {
      generic: {
        summary: 'Missing or invalid token',
        value: {
          statusCode: 401,
          message: 'Unauthorized',
          error: 'Unauthorized',
          timestamp: '2025-10-23T17:00:00.000Z',
          path: '/resource',
        },
      },
    },
  });
}

export function ApiForbiddenError(description = 'Forbidden') {
  return ApiResponse({
    status: 403,
    description,
    type: ErrorResponseDto,
    examples: {
      generic: {
        summary: 'Access denied',
        value: {
          statusCode: 403,
          message: 'You do not have permission to access this resource',
          error: 'Forbidden',
          timestamp: '2025-10-23T17:00:00.000Z',
          path: '/resource',
        },
      },
    },
  });
}

export function ApiNotFoundError(description = 'Not Found') {
  return ApiResponse({
    status: 404,
    description,
    type: ErrorResponseDto,
    examples: {
      generic: {
        summary: 'Resource not found',
        value: {
          statusCode: 404,
          message: 'Resource not found',
          error: 'Not Found',
          timestamp: '2025-10-23T17:00:00.000Z',
          path: '/resource/123',
        },
      },
    },
  });
}

export function ApiConflictError(description = 'Conflict') {
  return ApiResponse({
    status: 409,
    description,
    type: ErrorResponseDto,
    examples: {
      generic: {
        summary: 'Conflict with existing resource',
        value: {
          statusCode: 409,
          message: 'Conflict with existing resource',
          error: 'Conflict',
          timestamp: '2025-10-23T17:00:00.000Z',
          path: '/resource',
        },
      },
    },
  });
}

export function ApiInternalServerError(description = 'Internal Server Error') {
  return ApiResponse({
    status: 500,
    description,
    type: ErrorResponseDto,
    examples: {
      generic: {
        summary: 'Unexpected error',
        value: {
          statusCode: 500,
          message: 'Internal server error',
          error: 'Internal Server Error',
          timestamp: '2025-10-23T17:00:00.000Z',
          path: '/resource',
        },
      },
    },
  });
}
