"use client";

import { useEffect, useState } from "react";
import "@/app/globals2.css";
import { useRouter } from "next/navigation";
import { Roles } from "@/lib/types/userTypes";
import { discountsKeys, DiscountsTable, numberToAdminPermissions, numberToUserPermissions, permissionKeys, PermissionTable, permissionToAdminNumber, permissionToUserNumber } from "@/lib/auth/permissions";

export default function NewProductPage() {
    const router = useRouter();
    const [roleData, setRoleData] = useState<Roles>({
        nazwa: "",
        admin: 0,
        uzytkownik: 0,
    });
    const [adminPermissions, setAdminPermissions] = useState<string[]>([]);
    const [userPermissions, setUserPermissions] = useState<string[]>([]);
    const [pointerAdmin, setPointerAdmin] = useState<string>("none");
    const [pointerUser, setPointerUser] = useState<string>("none");

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

        console.log(adminPermissionsNumber, userPermissionsNumber);
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
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">
                        Uprawnienia administracyjne
                    </label>
                    <select
                        value={pointerAdmin}
                        onChange={(e) => {
                            handleAdminPermissions(e.target.value)
                            setPointerAdmin("none");
                        }}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring">
                        <option value="none">Wybierz uprawnienia administracyjne</option>
                        {permissionKeys.map((permission) => (
                            <option key={permission} value={permission}>
                                {permission}
                            </option>
                        ))}
                    </select>
                    <p className="text-sm text-muted-foreground">
                        Wybrane uprawnienia: {adminPermissions.length > 0 ? adminPermissions.join(", ") : "Nie wybrano uprawnień"}
                    </p>
                </div>

                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">
                        Uprawnienia użytkownika
                    </label>
                    <select
                        value={pointerUser}
                        onChange={(e) => {
                            handleUserPermissions(e.target.value)
                            setPointerUser("none");
                        }}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring">
                        <option value="none">Wybierz uprawnienia użytkownika</option>
                        {discountsKeys.map((discount) => (
                            <option key={discount} value={discount}>
                                {discount}
                            </option>
                        ))}
                    </select>
                    <p className="text-sm text-muted-foreground">
                        Wybrane uprawnienia: {userPermissions.length > 0 ? userPermissions.join(", ") : "Nie wybrano uprawnień"}
                    </p>
                </div>

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
