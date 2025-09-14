import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { LambdaService } from './lambda.service';
import lambdaConfig from './config/lambda.config';

@Module({
  imports: [HttpModule.register({}), ConfigModule.forFeature(lambdaConfig)],
  providers: [LambdaService],
  exports: [LambdaService],
})
export class LambdaModule {}
