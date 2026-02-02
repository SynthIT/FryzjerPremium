"use client";

import { useEffect, useState } from "react";
import { Roles } from "@/lib/types/userTypes";

export default function ProductsPage() {
    const [roles, setRoles] = useState<Roles[]>([]);
    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch("/admin/api/v1/roles", {
                    method: "GET",
                    credentials: "include",
                });
                const data: Roles[] = await response.json();
                console.log("Pobrane produkty:", data);
                setRoles(data);
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
                    href="/admin/manage/producents/new"
                    className="w-full rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto">
                    Dodaj role
                </a>
            </div>

            {roles && ()}
        </div>
    );
}

