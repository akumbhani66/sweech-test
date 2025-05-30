import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;

          this.logger.log(
            `[${request.method}] ${request.url} ${response.statusCode} ${responseTime}ms\n` +
              `Request Body: ${JSON.stringify(request.body)}\n` +
              `Response Body: ${JSON.stringify(data)}`,
          );
        },
        error: (error: any) => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;

          this.logger.error(
            `[${request.method}] ${request.url} ${error.status} ${responseTime}ms\n` +
              `Request Body: ${JSON.stringify(request.body)}\n` +
              `Error: ${JSON.stringify(error.message)}`,
          );
        },
      }),
    );
  }
}
