"use client";

import { useEffect, useMemo, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell, BellRing, Eye } from "lucide-react";
import { notificationsType } from "@/lib/types/notificationsTypes";
import { useRouter } from "next/navigation";

export default function NavbarNotificationComponent() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<notificationsType[]>([]);
    const [toast, setToast] = useState<number>(0);

    useEffect(() => {
        const fetchNotifications = async () => {
            const notifications = await fetch("/admin/api/v1/notifications", {
                credentials: "include",
                method: "GET",
            }).then(res => res.json()).then(data => data.notifications);
            setNotifications(notifications as notificationsType[]);
            setToast(notifications.filter((n: notificationsType) => !n.czy_przeczytane).length);
        };
        fetchNotifications();
    }, []);

    const notificationsToShow = useMemo(() => {
        return notifications.filter((n: notificationsType) => !n.czy_przeczytane);
    }, [notifications]);
    
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button aria-label="Powiadomienia" className="rounded p-2 transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring">
                    <Bell className="h-5 w-5" />
                    {toast > 0 && <span className="absolute top-[30px] right-[130px] bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">{toast}</span>}
                </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="min-w-[300px] max-h-[300px] overflow-y-auto mr-2 rounded-md p-1 bg-background border border-border">

                {notificationsToShow.length > 0 ? notificationsToShow.map((notification) => (
                    <DropdownMenu.Item key={notification._id} onClick={() => {
                        fetch(`/admin/api/v1/notifications?id=${notification._id}&czy_przeczytane=true`, {
                            credentials: "include",
                            method: "PUT",
                        }).then(res => res.json()).then(data => {
                            if (data.status === 0) {
                                setNotifications(notifications.map(n => n._id === notification._id ? data.notification : n));
                                router.push(notification.link ?? "/admin");
                            }
                        });
                    }} className="flex items-center gap-2 p-2 rounded-md hover:bg-accent">
                        {notification.czy_przeczytane ? <Bell className="h-5 w-5" /> : <BellRing color="red" className="h-5 w-5" />}
                        <span>{notification.nazwa}</span>
                        <span>{notification.typ}</span>
                        <span>{notification.tresc}</span>
                        <span>{new Date(notification.createdAt ?? new Date()).toLocaleString()}</span>
                    </DropdownMenu.Item>
                )) : <DropdownMenu.Item className="flex items-center gap-2 p-2 rounded-md">
                    <span>Brak powiadomień</span>
                </DropdownMenu.Item>}
                <DropdownMenu.Separator className="h-px bg-border" />
                <DropdownMenu.Item onClick={() => router.push("/admin/notifications")} className="flex items-center gap-2 p-2 rounded-md hover:bg-accent">
                    <Eye className="h-5 w-5" />
                    <span>Zobacz wszystkie powiadomienia</span>
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    );
}