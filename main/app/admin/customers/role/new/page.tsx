"use client";

import { useState } from "react";
import "@/app/globals2.css";
import { useRouter } from "next/navigation";
import { Roles } from "@/lib/types/userTypes";
import { DiscountsTable, PermissionTable, permissionToAdminNumber, permissionToUserNumber } from "@/lib/auth/permissions";
import RolePermissionsForm from "@/components/admin/RolePermissionsForm";

export default function NewProductPage() {
    const router = useRouter();
    const [roleData, setRoleData] = useState<Roles>({
        nazwa: "",
        admin: 0,
        uzytkownik: 0,
    });
    const [adminPermissions, setAdminPermissions] = useState<string[]>([]);
    const [userPermissions, setUserPermissions] = useState<string[]>([]);
    const handleAdminPermissions = (permissions: string) => {
        if (permissions === "none") return;
        setAdminPermissions((prev) => {
            if (prev.includes(permissions)) {
                return prev.filter((permission) => permission !== permissions);
            } else {
                return [...prev, permissions];
            }
        });
    }
    const handleUserPermissions = (permissions: string) => {
        if (permissions === "none") return;
        setUserPermissions((prev) => {
            if (prev.includes(permissions)) {
                return prev.filter((permission) => permission !== permissions);
            } else {
                return [...prev, permissions];
            }
        });
    }

    const sendNewRole = async () => {
        const adminPermissionsNumber = permissionToAdminNumber(adminPermissions as Array<keyof typeof PermissionTable>);
        const userPermissionsNumber = permissionToUserNumber(userPermissions as Array<keyof typeof DiscountsTable>);

        setRoleData({ ...roleData, admin: adminPermissionsNumber, uzytkownik: userPermissionsNumber });
        const response = await fetch("/admin/api/v1/roles", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(roleData),
        });
        const result = await response.json();
        if (result.status === 0) {
            alert("Rola została dodana pomyślnie!");
            router.push("/admin/customers/role");
        } else {
            alert("Błąd podczas dodawania roli: " + result.error);
        }
    };
    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    Dodaj rolę
                </h1>
                <p className="text-sm text-muted-foreground sm:text-base">
                    Uzupełnij informacje o roli.
                </p>
            </div>

            <form className="grid gap-4 rounded-lg border p-3 sm:p-4 sm:grid-cols-2">
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">Nazwa roli</label>
                    <input
                        value={roleData.nazwa}
                        onChange={(v) => {
                            setRoleData({ ...roleData, nazwa: v.target.value });
                        }}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        placeholder="Np. Admin"
                    />
                </div>
                <RolePermissionsForm
                    adminPermissions={adminPermissions}
                    userPermissions={userPermissions}
                    onAdminToggle={handleAdminPermissions}
                    onUserToggle={handleUserPermissions}
                />

                <div className="sm:col-span-2">
                    <button
                        onClick={(e) => { e.preventDefault(); sendNewRole(); }}
                        type="submit"
                        className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">
                        Zapisz role
                    </button>
                </div>
            </form>
        </div>
    );
}
