import { useIsAuth } from '@entities/auth';
import { SuccessResponse } from '@packages/types';
import { restService } from '@shared/api';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const REFRESH_SESSION_URL = '/auth/refresh';

const refreshSession = async () => {
  const res = await restService.POST<SuccessResponse, void>(REFRESH_SESSION_URL);

  return res.data;
};

export const useRefreshSession = () => {
  const { setIsAuth } = useIsAuth();

  return useMutation({
    mutationKey: ['refresh-session'],
    mutationFn: refreshSession,
    onError: () => {
      setIsAuth(false);
    },
  });
};

let refreshPromise: Promise<void> | null = null;
const ensureSessionRefreshed = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshSession()
      .then(() => {
        useIsAuth.setState({ isAuth: true });
      })
      .catch((err) => {
        useIsAuth.setState({ isAuth: false });
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export const initAuthInterceptor = () => {
  restService.httpClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const status = error.response?.status;
      const originalRequest = error.config as any;

      if (status === 401) {
        const url = originalRequest?.url as string | undefined;

        if (url?.includes(REFRESH_SESSION_URL)) {
          useIsAuth.setState({ isAuth: false });
          return Promise.reject(error);
        }

        if (originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            await ensureSessionRefreshed();
            return restService.httpClient.request(originalRequest);
          } catch (e) {
            return Promise.reject(e);
          }
        }
      }

      return Promise.reject(error);
    },
  );
};
