"use client";

import { useState, useEffect, useMemo } from "react";
import { Users, Roles } from "@/lib/types/userTypes";
import { X } from "lucide-react";

interface UserEditModalProps {
    user: Users;
    isOpen: boolean;
    onClose: () => void;
}

function getRoleId(r: Roles | string): string | null {
    if (typeof r === "string") return r;
    return (r as Roles)._id ?? null;
}

export default function UserEditModal({
    user,
    isOpen,
    onClose,
}: UserEditModalProps) {
    const [availableRoles, setAvailableRoles] = useState<Roles[]>([]);
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
    const [pointerRole, setPointerRole] = useState<string>("none");
    const [rolesLoading, setRolesLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const ids = (user.role ?? [])
            .map(getRoleId)
            .filter((id): id is string => id != null);
        setSelectedRoleIds(ids);
    }, [isOpen, user]);

    useEffect(() => {
        if (!isOpen) return;
        let cancelled = false;
        setRolesLoading(true);
        fetch("/admin/api/v1/roles", { credentials: "include" })
            .then((res) => res.ok ? res.json() : Promise.reject(new Error("Błąd pobierania ról")))
            .then((data) => {
                if (!cancelled && Array.isArray(data?.roles)) setAvailableRoles(data.roles);
            })
            .catch(() => {
                if (!cancelled) setAvailableRoles([]);
            })
            .finally(() => {
                if (!cancelled) setRolesLoading(false);
            });
        return () => { cancelled = true; };
    }, [isOpen]);

    const handleRoleSelect = (roleId: string) => {
        if (roleId === "none") return;
        setSelectedRoleIds((prev) =>
            prev.includes(roleId)
                ? prev.filter((id) => id !== roleId)
                : [...prev, roleId]
        );
        setPointerRole("none");
    };

    const selectedRoleNames = useMemo(() => {
        if (!selectedRoleIds.length) return "Nie wybrano ról";
        return selectedRoleIds
            .map((id) => availableRoles.find((r) => (r._id ?? "") === id)?.nazwa ?? id)
            .filter(Boolean)
            .join(", ");
    }, [selectedRoleIds, availableRoles]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold">Szczegóły użytkownika</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-accent rounded-md transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Dane użytkownika</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Imię</label>
                                <p className="px-3 py-2 border rounded-md bg-muted/50">{user.imie ?? "—"}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Nazwisko</label>
                                <p className="px-3 py-2 border rounded-md bg-muted/50">{user.nazwisko ?? "—"}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <p className="px-3 py-2 border rounded-md bg-muted/50">{user.email ?? "—"}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Telefon</label>
                                <p className="px-3 py-2 border rounded-md bg-muted/50">{user.telefon ?? "—"}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Rola</label>
                                {rolesLoading ? (
                                    <p className="px-3 py-2 border rounded-md bg-muted/50 text-muted-foreground">
                                        Ładowanie ról...
                                    </p>
                                ) : (
                                    <>
                                        <select
                                            value={pointerRole}
                                            onChange={(e) => handleRoleSelect(e.target.value)}
                                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring">
                                            <option value="none">Wybierz rolę</option>
                                            {availableRoles.map((role) => (
                                                <option
                                                    key={role._id ?? role.nazwa}
                                                    value={role._id ?? ""}>
                                                    {role.nazwa ?? role._id}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Wybrane role: {selectedRoleNames}
                                        </p>
                                    </>
                                )}

                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Adres</label>
                                <p className="px-3 py-2 border rounded-md bg-muted/50">
                                    {[user.ulica, user.nr_domu, user.nr_lokalu, user.kod_pocztowy, user.miasto, user.kraj]
                                        .filter(Boolean)
                                        .join(", ") || "—"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end p-6 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm border rounded-md hover:bg-accent transition-colors">
                        Zamknij
                    </button>
                </div>
            </div>
        </div>
    );
}
