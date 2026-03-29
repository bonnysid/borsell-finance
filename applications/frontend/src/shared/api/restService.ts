import { RestService } from '@devbonnysid/ui-kit-default';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3003/';

export const restService = new RestService({
  baseURL,
  timeout: 30_000,
  withCredentials: true,
});
