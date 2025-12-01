import { ValidationErrorResponse } from '@packages/types';
import { i18n } from '@shared/i18n';
import { AxiosError } from 'axios';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';

export const handleApiError = <D extends FieldValues>(
  error: unknown,
  form: UseFormReturn<D, any, D>,
) => {
  if (!(error instanceof Error) || !error) {
    return;
  }

  const axiosError = error as AxiosError;

  if (axiosError.status === 400) {
    const validationError = axiosError.response?.data as ValidationErrorResponse;

    if (validationError) {
      validationError.properties.forEach((property) => {
        property.errors.forEach((error) => {
          const [ns, ...rest] = error.code.split('.');

          form.setError(property.property as Path<D>, {
            message: i18n.t(rest.join('.'), { ...error.args, ns }),
          });
        });
      });
    }
  }
};
