import z from "zod";
import { Roles } from "../types/userTypes";

export const DiscountsTable = {
    "user:discount": 1 << 0,
    "user:premium": 1 << 1,
    "user:special": 1 << 2,
} as const;

export const PermissionTable = {
    "admin:orders": 1 << 0,
    "admin:products": 1 << 1,
    "admin:promo": 1 << 2,
    "admin:producent": 1 << 3,
    "admin:categories": 1 << 4,
    "admin:blog": 1 << 5,
    "admin:roles": 1 << 6,
    "admin:users": 1 << 7,
} as const;

export const permissionKeys = Object.keys(PermissionTable) as Array<
    keyof typeof PermissionTable
>;

export const discountsKeys = Object.keys(DiscountsTable) as Array<
    keyof typeof DiscountsTable
>;
export function permissionToAdminNumber(
    permission: Array<keyof typeof PermissionTable>
): number {
    let a: number = 0;
    for (const key of permission) {
        a |= PermissionTable[key];
    }
    return a;
}

export function permissionToUserNumber(
    permission: Array<keyof typeof DiscountsTable>
): number {
    let a: number = 0;
    for (const key of permission) {
        a |= DiscountsTable[key];
    }
    return a;
}

export function numberToAdminPermissions(code: number) {
    return permissionKeys.filter((key) => {
        return code & PermissionTable[key];
    });
}

export function numberToUserPermissions(code: number) {
    return discountsKeys.filter((key) => {
        return code & DiscountsTable[key];
    });
}

export function hasAnyAdminPermission(roles: Roles[]): boolean {
    let ok: boolean = false;
    for (const role of roles) {
        if (role.admin) ok = true;
    }
    return ok;
}

export function hasPermission(code: number, scope: number) {
    return (code & scope) !== 0;
}


export const userPermission = z.number().refine((val) => {
    return (
        val >= 0 &&
        val <= Object.values(DiscountsTable).reduce((a, b) => a | b, 0)
    );
});

export const adminPermission = z.number().refine((val) => {
    return (
        val >= 0 &&
        val <= Object.values(PermissionTable).reduce((a, b) => a | b, 0)
    );
});
