import { Module } from '@nestjs/common';
import { LoginRecordsController } from './login-records.controller';
import { LoginRecordsService } from './login-records.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [LoginRecordsController],
  providers: [LoginRecordsService, PrismaService],
})
export class LoginRecordsModule {}
