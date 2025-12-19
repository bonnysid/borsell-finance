import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ErrorProperty, ErrorPropertyObject, ValidationErrorResponse } from '@packages/types';
import { ValidationError } from 'class-validator';
import { I18nContext } from 'nestjs-i18n';

export class ApiValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const i18n = I18nContext.current();

        const formatted = errors.map<ErrorProperty>((err) => {
          const errors = Object.entries(err.constraints ?? {}).map(([constraintKey, raw]) => {
            const [key, metaJson] = String(raw).split('|');
            let meta: any = {};
            try {
              meta = metaJson ? JSON.parse(metaJson) : {};
            } catch {
              meta = {};
            }

            const { value, constraints, ...args } = meta;

            const translated = i18n
              ? i18n.t(key, { args: { ...args, property: err.property } })
              : key;

            return {
              message: translated,
              code: key,
              args,
            } as ErrorPropertyObject;
          });

          return {
            property: err.property,
            errors,
          };
        });

        return new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          properties: formatted,
        } as ValidationErrorResponse);
      },
    });
  }
}
