import { create } from 'zustand';

export type AppNotification = {
  id: string;
  title: string;
  body?: string;
  /** Сессия ассистента, к которой ведёт клик по уведомлению. */
  sessionId?: string;
};

type UseNotificationsStore = {
  notifications: AppNotification[];
  notify: (notification: Omit<AppNotification, 'id'>) => string;
  dismiss: (id: string) => void;
};

export const useNotifications = create<UseNotificationsStore>()((set) => ({
  notifications: [],
  notify: (notification) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set((state) => ({ notifications: [...state.notifications, { ...notification, id }] }));
    return id;
  },
  dismiss: (id) =>
    set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
}));
