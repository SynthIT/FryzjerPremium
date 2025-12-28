import { Model, model, models, Schema, Types } from "mongoose";
import { OrderList, schemaOrderList } from "./Orders";

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

export function permissionToNumber(
    permission: Array<keyof typeof PermissionTable>
): number {
    let a: number = 0;
    for (const key of permission) {
        a |= PermissionTable[key];
    }
    return a;
}

export function numberToPermission(code: number) {
    return permissionKeys.filter((key) => {
        return code & PermissionTable[key];
    });
}

export function hasPermission(code: number, scope: number) {
    return (code & scope) !== 0;
}

export type PermissionNumber =
    (typeof PermissionTable)[keyof typeof PermissionTable];

export interface Role {
    nazwa: string;
    permisje: PermissionNumber | number;
}

export interface Users {
    imie: string;
    nazwisko: string;
    email: string;
    haslo: string;
    nr_domu: string;
    nr_lokalu?: string;
    ulica: string;
    miasto: string;
    kraj: string;
    kod_pocztowy: string;
    telefon: string;
    osoba_prywatna: boolean;
    zamowienia: OrderList[] | Types.ObjectId[];
    nip?: string | null;
    faktura?: boolean | null;
    role?: Role[] | Types.ObjectId[];
}

const roleSchema = new Schema<Role>(
    {
        nazwa: { type: String, required: true, unique: true },
        permisje: { type: Number, required: true, default: 0 },
    },
    {
        timestamps: true,
    }
);

export const userSchema = new Schema<Users>(
    {
        imie: { type: String, required: true },
        nazwisko: { type: String, required: true },
        email: { type: String, required: true },
        haslo: { type: String, required: true },
        nr_domu: { type: String, required: true },
        nr_lokalu: String,
        ulica: { type: String, required: true },
        miasto: { type: String, required: true },
        kraj: { type: String, required: true },
        kod_pocztowy: { type: String, required: true },
        telefon: { type: String, required: true },
        nip: String,
        zamowienia: { type: [Types.ObjectId], ref: "Orders", default: [] },
        faktura: { type: Boolean, default: false },
        osoba_prywatna: { type: Boolean, default: true },
        role: { type: [Types.ObjectId], ref: "Roles", default: [] },
    },
    {
        timestamps: true,
    }
);

export const Role: Model<Role> =
    (models.Roles as Model<Role>) ?? model<Role>("Roles", roleSchema);
export const User: Model<Users> =
    (models.Users as Model<Users>) ?? model<Users>("Users", userSchema);

export const Order: Model<OrderList> =
    models.Orders ?? model<OrderList>("Orders", schemaOrderList);
