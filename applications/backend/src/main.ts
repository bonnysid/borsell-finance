import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';

import { ApiValidationPipe } from '@/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable cookies parsing
  app.use(cookieParser());

  // Enable CORS for local development and configurable origin via env
  const defaultOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];
  const envOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const origins = envOrigins.length ? envOrigins : defaultOrigins;

  app.enableCors({
    origin: (origin, callback) => {
      // allow non-browser requests (e.g., curl, Postman) where origin may be undefined
      if (!origin) return callback(null, true);

      const isAllowed =
        origins.includes(origin) ||
        // Allow any local network IP for development
        /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(
          origin,
        );

      return callback(
        isAllowed ? null : new Error(`CORS: Origin ${origin} not allowed`),
        isAllowed,
      );
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,X-Requested-With,Accept',
    exposedHeaders: 'Set-Cookie',
  });

  app.useGlobalPipes(new ApiValidationPipe());

  await app.listen(process.env.PORT ?? 3003);
}
bootstrap();
