import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import lambdaConfig from './config/lambda.config';

@Injectable()
export class LambdaService {
  constructor(
    private readonly http: HttpService,
    @Inject(lambdaConfig.KEY)
    private readonly config: ConfigType<typeof lambdaConfig>,
  ) {}

  // Exemplo: análise de sentimento ou contagem de palavras
  async analyzeTweet(text: string) {
    try {
      const { data } = await firstValueFrom(
        this.http.post<any>(
          this.config.apiUrl,
          { text },
          {
            timeout: this.config.timeoutMs,
            headers: {
              ...(this.config.apiKey
                ? { 'x-api-key': this.config.apiKey }
                : {}),
              'content-type': 'application/json',
            },
          },
        ),
      );
      return data;
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 401 || status === 403) {
        throw new UnauthorizedException('Unauthorized calling Lambda API');
      }

      const details = err?.response?.data ?? err?.message ?? 'Unknown error';
      throw new InternalServerErrorException(
        `Lambda call failed: ${JSON.stringify(details)}`,
      );
    }
  }
}
