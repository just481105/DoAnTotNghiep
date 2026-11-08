import { Module } from '@nestjs/common';
import { Sm2Service } from './sm2.service';
import { Sm2Controller } from './sm2.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [Sm2Controller],
  providers: [Sm2Service],
})
export class Sm2Module {}
