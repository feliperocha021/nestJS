import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// PartialType vai pegar todas as propriedades e validções do CreateUserDto, mas vai deixar todas opcionais
export class UpateUserDto extends PartialType(CreateUserDto) {}
