"use client";

import { Roles, Users } from "@/lib/types/userTypes";
import { User } from "lucide-react";

interface UserCardProps {
    user: Users;
    onClick: () => void;
}

export default function UserCard({
    user,
    onClick,
}: UserCardProps) {
    return (
        <div
            onClick={onClick}
            className="border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer bg-card hover:bg-accent/50 group border-[var(--border)]">
            {/* Content */}
            <div className="space-y-1 text-center">
                <div className="flex items-center justify-center mb-2 bg-[color:var(--primary-dark)] rounded-full p-2">
                    <User className="h-16 w-16 text-white" />    
                </div>
                <h3>Użytkownik ID: {user._id || "Brak ID"}</h3>
                <p>Imię: {user.imie || "Brak imienia"}</p>
                <p>Nazwisko: {user.nazwisko || "Brak nazwiska"}</p>
                <p>Email: {user.email || "Brak emaila"}</p>
                <p>Rola: {user.role?.map((role) => (role as Roles).nazwa).join(", ") || "Brak roli"}</p>
                <p>Utworzono: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Brak daty"}</p>
            </div >
        </div >
    );
}