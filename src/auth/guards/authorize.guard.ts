import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import authConfig from '../config/auth.config';
import { Reflector } from '@nestjs/core';
import { REQUEST_USER_KEY } from 'src/constants/constants';

@Injectable()
export class AuthorizeGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,

    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // lendo metadados
    const isPublic: boolean | undefined = this.reflector.getAllAndOverride(
      'isPublic',
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    // extrair o contexto da solicitação
    const request: Request = context.switchToHttp().getRequest();

    // extrair o token do cabeçalho da solicitação
    const authHeader = request.headers?.['authorization'];
    const token =
      typeof authHeader === 'string' ? authHeader.split(' ')[1] : undefined;

    // validar o token
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload: { sub: string; username: string } =
        await this.jwtService.verifyAsync(token, this.authConfiguration);
      request[REQUEST_USER_KEY] = payload;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException();
    }

    return true;
  }
}
