import { Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import s3Config from './config/s3.config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';
import { Inject } from '@nestjs/common';

@Injectable()
export class S3Service {
  private s3: S3Client;

  constructor(
    @Inject(s3Config.KEY)
    private readonly config: ConfigType<typeof s3Config>,
  ) {
    this.s3 = new S3Client({
      region: this.config.region,
    });
  }

  async uploadProfileImage(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new Error('Nenhum arquivo enviado');
    }

    const fileKey = `profiles/${uuid()}${extname(file.originalname)}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return fileKey; // se o bucket fosse público retornaria uma url return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${fileKey}`
  }
}
