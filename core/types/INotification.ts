export interface INotification {
  id: string;
  title: string;
  message: string;
  type: "warning" | "exceeded" | "info";
  timestamp: number;
  isRead: boolean;
  cardId?: string;
}
