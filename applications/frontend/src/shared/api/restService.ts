import { RestService } from '@devbonnysid/ui-kit-default';
import i18n from '@shared/i18n';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3003/';

export const restService = new RestService({
  baseURL,
  timeout: 30_000,
  withCredentials: true,
});

restService.httpClient.interceptors.request.use((config) => {
  config.headers['Accept-Language'] = i18n.language;
  return config;
});
