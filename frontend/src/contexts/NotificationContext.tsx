import React, { createContext, useContext, ReactNode } from "react";
import { notification, message } from "antd";

// ประเภทของ notification
export type NotificationType = "success" | "info" | "warning" | "error";

interface NotificationContextType {
  showNotification: (options: { message: string; description?: string; type?: NotificationType }) => void;
  showMessage: (msg: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const showNotification = ({
    message: msg,
    description,
    type = "info",
  }: {
    message: string;
    description?: string;
    type?: NotificationType;
  }) => {
    notification[type]({
      message: msg,
      description,
      placement: "topRight",
    });
  };

  const showMessage = (msg: string, type: NotificationType = "info") => {
    message[type](msg);
  };

  return (
    <NotificationContext.Provider value={{ showNotification, showMessage }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within a NotificationProvider");
  return ctx;
}; 