import { Module } from '@nestjs/common';
import { Sm2Service } from './sm2.service';
import { Sm2Controller } from './sm2.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule, AuthModule],
  controllers: [Sm2Controller],
  providers: [Sm2Service],
})
export class Sm2Module {}
