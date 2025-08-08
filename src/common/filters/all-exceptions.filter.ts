import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let payload =
      exception instanceof HttpException
        ? exception.getResponse()
        : { statusCode: status, message: 'Internal server error' };

    // Tratamento de erro de conexão (ECONNREFUSED) → 408
    if (exception instanceof Error && 'code' in exception) {
      const err = exception;
      if (err.code === 'ECONNREFUSED') {
        status = HttpStatus.REQUEST_TIMEOUT;
        payload = {
          statusCode: status,
          message: 'Could not connect to database. Please try again later.',
        };
      }
    }

    // Tratamento de erros de query do TypeORM → 400
    if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      payload = {
        statusCode: status,
        message: exception.message,
      };
    }

    this.logger.error(`Status: ${status} — Error: ${JSON.stringify(payload)}`);

    response.status(status).json({
      ...(typeof payload === 'object'
        ? payload
        : { statusCode: status, message: payload }),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
