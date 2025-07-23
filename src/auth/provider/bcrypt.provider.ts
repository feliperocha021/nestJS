import { Injectable } from '@nestjs/common';
import { HashingProvider } from './hashing.provider';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptProvider implements HashingProvider {
  public async hashPassword(password: string | Buffer): Promise<string> {
    // generate the salt
    const salt: string = await bcrypt.genSalt();

    // hast the password
    const hash: string = await bcrypt.hash(password, salt);

    return hash;
  }

  public async comparePassword(
    plainPassword: string | Buffer,
    hashedPassword: string | Buffer,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

// VERSÃO SEM ERROS DE ESLINT:
// import { Injectable } from '@nestjs/common';
// import { HashingProvider } from './hashing.provider';
// import bcrypt from 'bcryptjs';

// @Injectable()
// export class BcryptProvider implements HashingProvider {
//   public async hashPassword(password: string | Buffer): Promise<string> {
//     const salt: string = await bcrypt.genSalt();
//     return await bcrypt.hash(password.toString(), salt);
//   }

//   public async comparePassword(
//     plainPassword: string | Buffer,
//     hashedPassword: string | Buffer,
//   ): Promise<boolean> {
//     return await bcrypt.compare(
//       plainPassword.toString(),
//       hashedPassword.toString(),
//     );
//   }
// }
