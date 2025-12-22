import { SelectOption } from '@devbonnysid/ui-kit-default';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

export const yupNumberString = () => {
  return yup
    .string()
    .test(
      'is-number',
      'Invalid number',
      (value) => !value || !isNaN(Number(value)),
    ) as yup.Schema<string>;
};

export const yupSelectOption = <T = string>() => {
  return yup.object<SelectOption<T>>({
    label: yup.string().optional(),
    value: yup.mixed().required(),
  });
};

export const schemeResolver = (
  schema: yup.ObjectSchema<any, any, any, any> | yup.Lazy<any, yup.AnyObject, any>,
) => {
  return yupResolver(schema);
};
