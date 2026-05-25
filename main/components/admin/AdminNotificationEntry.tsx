"use client";

import { notificationsType } from "@/lib/types/notificationsTypes";
import { CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";


export const AdminNotificationEntry = ({ notification }: { notification: notificationsType }) => {
    const router = useRouter();
    const handleClick = () => {
        if (notification.link) {
            router.push(notification.link);
        }
    }
    return (
        <tr className="border-1 cursor-pointer hover:bg-accent" onClick={handleClick}>
            <td className="text-md p-2 m-2 text-center">{notification.czy_przeczytane ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}</td>
            <td className="text-md p-2 m-2 ">{notification.typ}</td>
            <td className="text-md p-2 m-2">{notification.nazwa}</td>
            <td className="text-md p-2 m-2">{notification.tresc}</td>
            <td className="text-md p-2 m-2">{new Date(notification.createdAt ?? new Date()).toLocaleString()}</td>
        </tr>
    );
}