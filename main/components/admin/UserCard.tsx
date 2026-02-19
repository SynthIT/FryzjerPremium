"use client";

import { Roles, Users } from "@/lib/types/userTypes";

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
            className="border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer bg-card hover:bg-accent/50 group">
            {/* Content */}
            <div className="space-y-2">
                {/* Title */}
                <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    Nazwa: {user.imie || "Brak imienia"} {user.nazwisko || "Brak nazwiska"} {user.email || "Brak emaila"}
                </h3>
                <p className="text-sm text-muted-foreground">
                    Email: {user.email || "Brak emaila"}
                </p>
                <p className="text-sm text-muted-foreground">
                    Rola: {user.role?.map((role) => (role as Roles).nazwa).join(", ") || "Brak roli"}
                </p>
            </div >
        </div >
    );
}