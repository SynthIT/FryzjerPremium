import { NextRequest, NextResponse } from "next/server";
import { Notifications, } from "@/lib/models/Notifications";
import { notificationsType, notificationsTypes } from "@/lib/types/notificationsTypes";

export async function GET(req: NextRequest) {
    try {
        const notifications = await Notifications.find({ czy_aktywne: true });
        return NextResponse.json({ status: 0, notifications: notifications });
    } catch (error) {
        return NextResponse.json({ status: 1, error: "Błąd podczas pobierania powiadomień" }, { status: 500 });
    }
}
export async function POST(req: NextRequest) {
    try {
        const { notification } = await req.json();
        const ok = notificationsTypes.safeParse(notification);
        if (!ok.success) {
            return NextResponse.json({ status: 1, error: "Błąd podczas parsowania powiadomienia" }, { status: 400 });
        }
        const newNotification = await Notifications.create(ok.data);
        return NextResponse.json({ status: 0, notification: newNotification });
    } catch (error) {
        return NextResponse.json({ status: 1, error: "Błąd podczas tworzenia powiadomienia" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const id = searchParams.get("id");
        const czy_przeczytane = searchParams.get("czy_przeczytane");
        if (!id || !czy_przeczytane) {
            return NextResponse.json({ status: 1, error: "Nieprawidłowe parametry" }, { status: 400 });
        }
        const notification = await Notifications.findByIdAndUpdate(id, { czy_przeczytane: true }) as notificationsType;
        return NextResponse.json({ status: 0, notification: notification as notificationsType });
    } catch (error) {
        return NextResponse.json({ status: 1, error: "Błąd podczas aktualizacji powiadomienia" }, { status: 500 });
    }
}