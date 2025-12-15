import { generatePath } from 'react-router';

export enum AppRoutes {
  AUTH = '/auth',
  AUTH_SIGN_IN = '/auth/sign-in',
  AUTH_SIGN_UP = '/auth/sign-up',

  DASHBOARD = '/dashboard',

  ASSISTANT = '/assistant',

  PORTFOLIO = '/portfolio',
  PORTFOLIO_CREATE = '/portfolio/create',

  TRANSACTIONS = '/transactions',
}

type ParamsObject<R extends string, O extends string> = ([R] extends [never]
  ? {}
  : { [K in R]: string | number }) &
  ([O] extends [never] ? {} : { [K in O]?: string | number });

type ExtractParams<
  S extends string,
  Req extends string = never,
  Opt extends string = never,
> = S extends `${string}:${infer Tail}`
  ? Tail extends `${infer Param}?/${infer Rest}`
    ? ExtractParams<`/${Rest}`, Req, Opt | Param>
    : Tail extends `${infer Param}/${infer Rest}`
      ? ExtractParams<`/${Rest}`, Req | Param, Opt>
      : Tail extends `${infer Param}?`
        ? { required: Req; optional: Opt | Param }
        : { required: Req | Tail; optional: Opt }
  : { required: Req; optional: Opt };

type LinkFn<S extends string> = ExtractParams<S> extends { required: infer R; optional: infer O }
  ? [R] extends [never]
    ? (params?: ParamsObject<never, O & string>) => string
    : (params: ParamsObject<R & string, O & string>) => string
  : () => string;

const createRoutePaths = <T extends Record<string, string>>(
  paths: T,
): { [K in keyof T]: LinkFn<T[K]> } => {
  type Result = { [K in keyof T]: LinkFn<T[K]> };
  const result = {} as Result;

  (Object.keys(paths) as (keyof T)[]).forEach((key) => {
    const pattern = paths[key];
    // приведение типов только внутри реализации
    result[key] = ((params?: unknown) =>
      generatePath(pattern, params as any)) as Result[typeof key];
  });

  return result;
};

export const AppRoutePaths = createRoutePaths(AppRoutes);
