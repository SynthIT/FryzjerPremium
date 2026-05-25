"use client";

import { useState, useEffect, useMemo } from "react";
import { notificationsType } from "@/lib/types/notificationsTypes";
import { AdminNotificationEntry } from "@/components/admin/AdminNotificationEntry";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<notificationsType[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const notificationsPerPage = 12;
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function fetchNotifications() {
            await fetch("/admin/api/v1/notifications", {
                credentials: "include",
                method: "GET",
            }).then(res => res.json()).then(data => {
                if (data.status === 0) {
                    setLoading(false);
                    setNotifications(data.notifications as notificationsType[]);
                }
            }).catch(err => {
                console.error(err);
                setLoading(false);
                setNotifications([]);
            });
        }
        fetchNotifications();
    }, []);


    const filteredNotifications = useMemo(() => {
        return notifications.filter((notification) => {
            return notification.nazwa.toLowerCase().includes(searchQuery.toLowerCase()) || notification.typ.toLowerCase().includes(searchQuery.toLowerCase()) || notification.tresc.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [notifications, searchQuery]);


    const notificationsToShow = useMemo(() => {
        return filteredNotifications.slice((currentPage - 1) * notificationsPerPage, currentPage * notificationsPerPage);
    }, [filteredNotifications, currentPage]);

    const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
                    <p className="mt-4 text-muted-foreground">
                        Ładowanie powiadomień...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-gray-900 flex items-center gap-2 text-2xl font-semibold tracking-tight text-[var(--text-dark)] sm:text-3xl">
                        <Bell className="h-8 w-8 text-[var(--primary-dark)]" />
                        Powiadomienia
                    </h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Przeglądaj powiadomienia.
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <input
                    type="text"
                    placeholder="Szukaj powiadomienia..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="px-4 py-2 border rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {notifications.length} powiadomień
                </div>
            </div>
            <div className="">
                <div className="rounded-lg border">
                    <table>
                        <thead>
                            <tr className="border-1">
                                <th className="text-left w-1/12">Przeczytane?</th>
                                <th className="text-left w-1/12">Typ</th>
                                <th className="text-left w-1/12">Nazwa</th>
                                <th className="text-left w-1/3">Treść</th>
                                <th className="text-left w-1/18">Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notificationsToShow.map((notification) => (
                                <AdminNotificationEntry key={notification._id} notification={notification} />
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-center">
                    {totalPages > 1 && (
                        <button className="rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Poprzednia</button>
                    )}
                    {totalPages > 1 && (
                        <button className="rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Następna</button>
                    )}
                </div>
            </div>
        </div>
    );
}
