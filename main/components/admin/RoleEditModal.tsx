"use client";

import { useState, useEffect } from "react";
import { Roles } from "@/lib/types/userTypes";
import { X, Save, Trash2 } from "lucide-react";
import {
    discountsKeys,
    DiscountsTable,
    permissionKeys,
    PermissionTable,
    permissionToAdminNumber,
    permissionToUserNumber,
    numberToAdminPermissions,
    numberToUserPermissions,
} from "@/lib/auth/permissions";

interface RoleEditModalProps {
    role: Roles;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (role: Roles) => void;
    onDelete: (roleNazwa: string) => void;
}

export default function RoleEditModal({
    role,
    isOpen,
    onClose,
    onUpdate,
    onDelete,
}: RoleEditModalProps) {
    const [editedRole, setEditedRole] = useState<Roles>(role);
    const [adminPermissions, setAdminPermissions] = useState<string[]>([]);
    const [userPermissions, setUserPermissions] = useState<string[]>([]);
    const [pointerAdmin, setPointerAdmin] = useState<string>("none");
    const [pointerUser, setPointerUser] = useState<string>("none");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setEditedRole(role);
        setAdminPermissions(role.admin != null ? numberToAdminPermissions(role.admin) : []);
        setUserPermissions(role.uzytkownik != null ? numberToUserPermissions(role.uzytkownik) : []);
    }, [role]);

    const handleAdminPermissions = (permission: string) => {
        if (permission === "none") return;
        setAdminPermissions((prev) =>
            prev.includes(permission)
                ? prev.filter((p) => p !== permission)
                : [...prev, permission]
        );
    };

    const handleUserPermissions = (permission: string) => {
        if (permission === "none") return;
        setUserPermissions((prev) =>
            prev.includes(permission)
                ? prev.filter((p) => p !== permission)
                : [...prev, permission]
        );
    };

    useEffect(() => {
        const adminNum = permissionToAdminNumber(adminPermissions as Array<keyof typeof PermissionTable>);
        const userNum = permissionToUserNumber(userPermissions as Array<keyof typeof DiscountsTable>);
        setEditedRole((prev) => ({ ...prev, admin: adminNum, uzytkownik: userNum }));
    }, [adminPermissions, userPermissions]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                ...editedRole,
                admin: permissionToAdminNumber(adminPermissions as Array<keyof typeof PermissionTable>),
                uzytkownik: permissionToUserNumber(userPermissions as Array<keyof typeof DiscountsTable>),
            };
            const response = await fetch("/admin/api/v1/roles", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (result.status === 0 || response.ok) {
                onUpdate({ ...payload });
            } else {
                alert("Błąd podczas zapisywania: " + (result.error || "Nieznany błąd"));
            }
        } catch (error) {
            console.error("Błąd podczas zapisywania roli:", error);
            alert("Błąd podczas zapisywania roli.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Czy na pewno chcesz usunąć tę rolę?")) return;
        try {
            const response = await fetch(
                `/admin/api/v1/roles?slug=${encodeURIComponent(editedRole.nazwa)}`,
                { method: "DELETE", credentials: "include" }
            );
            const result = await response.json();
            if (result.status === 0 || response.ok) {
                onDelete(editedRole.nazwa);
            } else {
                alert("Błąd podczas usuwania roli: " + (result.error || "Nieznany błąd"));
            }
        } catch (error) {
            console.error("Błąd podczas usuwania roli:", error);
            alert("Błąd podczas usuwania roli.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold">Edytuj rolę</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-accent rounded-md transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Podstawowe informacje</h3>
                        <div>
                            <label className="block text-sm font-medium mb-1">Nazwa roli *</label>
                            <input
                                type="text"
                                value={editedRole.nazwa || ""}
                                onChange={(e) =>
                                    setEditedRole((prev) => ({ ...prev, nazwa: e.target.value }))
                                }
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Uprawnienia administracyjne</h3>
                        <select
                            value={pointerAdmin}
                            onChange={(e) => {
                                handleAdminPermissions(e.target.value);
                                setPointerAdmin("none");
                            }}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                            <option value="none">Wybierz uprawnienie</option>
                            {permissionKeys.map((key) => (
                                <option key={key} value={key}>
                                    {key}
                                </option>
                            ))}
                        </select>
                        <p className="text-sm text-muted-foreground">
                            Wybrane: {adminPermissions.length ? adminPermissions.join(", ") : "Brak"}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Uprawnienia użytkownika (zniżki)</h3>
                        <select
                            value={pointerUser}
                            onChange={(e) => {
                                handleUserPermissions(e.target.value);
                                setPointerUser("none");
                            }}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                            <option value="none">Wybierz uprawnienie</option>
                            {discountsKeys.map((key) => (
                                <option key={key} value={key}>
                                    {key}
                                </option>
                            ))}
                        </select>
                        <p className="text-sm text-muted-foreground">
                            Wybrane: {userPermissions.length ? userPermissions.join(", ") : "Brak"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between p-6 border-t">
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Usuń
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm border rounded-md hover:bg-accent transition-colors">
                            Anuluj
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50">
                            <Save className="h-4 w-4" />
                            {isSaving ? "Zapisywanie..." : "Zapisz"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
