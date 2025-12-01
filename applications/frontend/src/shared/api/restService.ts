import { RestService } from '@devbonnysid/ui-kit-default';

export const restService = new RestService({
  baseURL: 'http://localhost:3003/',
  timeout: 30_000,
  withCredentials: true,
});
