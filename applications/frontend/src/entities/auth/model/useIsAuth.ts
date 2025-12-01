import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UseIsAuthStore = {
  isAuth: boolean;
  setIsAuth: (isAuth: boolean) => void;
};

export const useIsAuth = create<UseIsAuthStore>()(
  persist(
    (set) => ({
      isAuth: false,
      setIsAuth: (isAuth) => set({ isAuth }),
    }),
    {
      name: 'isAuth',
    },
  ),
);
