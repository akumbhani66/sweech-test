import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { LoginRecordsModule } from './login-records/login-records.module';
import { PrismaService } from './prisma/prisma.service';
import { validate } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    AuthModule,
    PostsModule,
    CommentsModule,
    LoginRecordsModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
