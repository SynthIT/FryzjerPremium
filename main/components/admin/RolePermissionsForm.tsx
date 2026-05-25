"use client";

import {
    discountsKeys,
    permissionKeys,
} from "@/lib/auth/permissions";
import { adminInputClass, adminModalInputClass } from "./adminFormStyles";

type Variant = "page" | "modal";

interface RolePermissionsFormProps {
    adminPermissions: string[];
    userPermissions: string[];
    onAdminToggle: (permission: string) => void;
    onUserToggle: (permission: string) => void;
    variant?: Variant;
}

export default function RolePermissionsForm({
    adminPermissions,
    userPermissions,
    onAdminToggle,
    onUserToggle,
    variant = "page",
}: RolePermissionsFormProps) {
    const selectClass = variant === "page" ? adminInputClass : adminModalInputClass;

    return (
        <>
            <div className="grid gap-2 sm:col-span-2">
                <label className="text-sm font-medium">
                    Uprawnienia administracyjne
                </label>
                <select
                    defaultValue="none"
                    onChange={(e) => {
                        onAdminToggle(e.target.value);
                        e.target.value = "none";
                    }}
                    className={selectClass}>
                    <option value="none">Wybierz uprawnienia administracyjne</option>
                    {permissionKeys.map((permission) => (
                        <option key={permission} value={permission}>
                            {permission}
                        </option>
                    ))}
                </select>
                <p className="text-sm text-muted-foreground">
                    Wybrane:{" "}
                    {adminPermissions.length > 0
                        ? adminPermissions.join(", ")
                        : "Nie wybrano uprawnień"}
                </p>
            </div>
            <div className="grid gap-2 sm:col-span-2">
                <label className="text-sm font-medium">Uprawnienia użytkownika</label>
                <select
                    defaultValue="none"
                    onChange={(e) => {
                        onUserToggle(e.target.value);
                        e.target.value = "none";
                    }}
                    className={selectClass}>
                    <option value="none">Wybierz uprawnienia użytkownika</option>
                    {discountsKeys.map((discount) => (
                        <option key={discount} value={discount}>
                            {discount}
                        </option>
                    ))}
                </select>
                <p className="text-sm text-muted-foreground">
                    Wybrane:{" "}
                    {userPermissions.length > 0
                        ? userPermissions.join(", ")
                        : "Nie wybrano uprawnień"}
                </p>
            </div>
        </>
    );
}
