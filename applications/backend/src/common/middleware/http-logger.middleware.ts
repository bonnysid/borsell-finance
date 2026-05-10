import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

type RequestWithRoute = Request & {
  route?: {
    path?: string | RegExp | Array<string | RegExp>;
  };
};

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: RequestWithRoute, res: Response, next: NextFunction) {
    const startedAt = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startedAt;
      const endpoint = this.resolveEndpoint(req);
      const message = `${req.method} ${req.originalUrl} -> ${res.statusCode} ${duration}ms`;

      if (res.statusCode >= 500) {
        this.logger.error(message);
        return;
      }

      if (res.statusCode >= 400) {
        this.logger.warn(message);
        return;
      }

      this.logger.log(message);
    });

    next();
  }

  private resolveEndpoint(req: RequestWithRoute): string {
    const routePath = req.route?.path;

    if (!routePath) {
      return 'UNMATCHED';
    }

    const normalizedPath = Array.isArray(routePath)
      ? routePath.map((path) => path.toString()).join('|')
      : routePath.toString();

    return `${req.method} ${normalizedPath}`;
  }
}
