import { Signal, signal } from "@preact/signals";
import { INotification } from "../types/INotification.ts";

export const notificationsSignal = signal<INotification[]>([]);

export const addNotification = (notification: Omit<INotification, "id" | "timestamp" | "isRead">) => {
  const newNotification: INotification = {
    ...notification,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    isRead: false,
  };
  
  notificationsSignal.value = [newNotification, ...notificationsSignal.value];
};

export const markAsRead = (notificationId: string) => {
  notificationsSignal.value = notificationsSignal.value.map(notification =>
    notification.id === notificationId
      ? { ...notification, isRead: true }
      : notification
  );
};

export const clearAllNotifications = () => {
  notificationsSignal.value = [];
};

export const getUnreadCount = () => {
  return notificationsSignal.value.filter(n => !n.isRead).length;
};