import { Module } from '@nestjs/common';
import { Sm2Service } from './sm2.service';
import { Sm2Controller } from './sm2.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [Sm2Controller],
  providers: [Sm2Service, PrismaService],
})
export class Sm2Module {}
