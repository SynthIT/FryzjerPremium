"use client";

import { Roles } from "@/lib/types/userTypes";
import { useState } from "react";
import { useEffect } from "react";
import { numberToAdminPermissions, numberToUserPermissions } from "@/lib/auth/permissions";

interface AdminRoleCardProps {
    role: Roles;
    onClick: () => void;
}

export default function AdminRoleCard({
    role,
    onClick,
}: AdminRoleCardProps) {
    const [adminPermissionNames, setAdminPermissionNames] = useState<string[]>([]);
    const [userPermissionNames, setUserPermissionNames] = useState<string[]>([]);

    useEffect(() => {
        if (!role.admin) {
            setAdminPermissionNames(["Brak uprawnień administracyjnych"]);
            return;
        } else {
            setAdminPermissionNames(numberToAdminPermissions(role.admin));
        }
        if (!role.uzytkownik) {
            setUserPermissionNames(["Brak uprawnień do specjalnych zniżek"]);
            return;
        } else {
            setUserPermissionNames(numberToUserPermissions(role.uzytkownik));
        }
    }, [role]);

    const preparedNames = () => {
        const adminNames = adminPermissionNames.map((name) => {
            return name.split(":").pop();
        });
        const userNames = userPermissionNames.map((name) => {
            return name.split(":").pop();
        });
        return {
            adminNames,
            userNames,
        };
    }

    return (
        <div
            onClick={onClick}
            className="border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer bg-card hover:bg-accent/50 group">
            {/* Content */}
            <div className="space-y-2">
                {/* Title */}
                <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    Nazwa: {role.nazwa || "Brak nazwy"} </h3>
                <p className="text-sm text-muted-foreground">
                    Uzytkownik: {preparedNames().userNames.join(", ")}
                </p>
                <p className="text-sm text-muted-foreground">
                    Admin: {preparedNames().adminNames.join(", ")}
                </p>
            </div>
        </div>
    );
}