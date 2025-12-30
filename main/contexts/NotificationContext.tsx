"use client";

import React, { createContext, useContext, ReactNode } from "react";

export type NotificationType = "info" | "log" | "error" | "warning";

interface NotificationContextType {
    notify: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const notify = (message: string, type: NotificationType = "info") => {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] ${type.toUpperCase()}:`;
        switch (type) {
            case "log":
                console.log(
                    `%c${prefix} ${message}`,
                    "color: green; font-weight: bold;"
                );
                break;
            case "error":
                console.error(`${prefix} ${message}`);
                break;
            case "warning":
                console.warn(`${prefix} ${message}`);
                break;
            default:
                console.info(`${prefix} ${message}`);
        }
   };

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error(
            "useNotification must be used within a NotificationProvider"
        );
    }
    return context;
}
