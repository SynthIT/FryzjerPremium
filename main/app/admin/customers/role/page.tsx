"use client";

import { useEffect, useState } from "react";
import { Roles } from "@/lib/types/userTypes";
import AdminRoleCard from "@/components/admin/AdminRoleCart";

export default function ProductsPage() {
    const [roles, setRoles] = useState<Roles[]>([]);
    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch("/admin/api/v1/roles", {
                    method: "GET",
                    credentials: "include",
                });
                const data: { roles: Roles[] } = await response.json();
                console.log("Pobrane role:", data);
                setRoles(data.roles);
            } catch (error) {
                console.error("Błąd podczas pobierania produktów:", error);
            }
        }
        fetchProducts();
    }, []);
    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        Role
                    </h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Dodawaj, edytuj i organizuj role.
                    </p>
                </div>
                <a
                    href="/admin/customers/role/new"
                    className="w-full rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto">
                    Dodaj role
                </a>
            </div>
            {roles && roles.length > 0 ? (
                roles.map((val) => (
                    <AdminRoleCard key={val.nazwa} role={val} onClick={() => { }}></AdminRoleCard>
                ))
            ) : (
                <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                    Brak ról.
                </div>
            )}
        </div>
    );
}

