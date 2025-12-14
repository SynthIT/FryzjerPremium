import { model, Schema } from "mongoose";
import { OrderList, schemaOrderList } from "./Orders";

export const PermissionTable = {
    "admin:products": 1 << 0,
    "admin:categories": 1 << 1,
    "admin:blog": 1 << 2,
    "admin:roles": 1 << 3,
    "admin:users": 1 << 4,
} as const;

export type Permission = (typeof PermissionTable)[keyof typeof PermissionTable];

export interface Role {
    nazwa: string;
    permisje: number;
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
    zamowienia: OrderList[];
    nip?: string | null;
    faktura?: boolean | null;
    role?: Role[];
}

const roleSchema = new Schema(
    {
        nazwa: { type: String, required: true },
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
        zamowienia: { type: [schemaOrderList], default: [] },
        faktura: { type: Boolean, default: false },
        osoba_prywatna: { type: Boolean, default: true },
        role: { type: [roleSchema], default: [] },
    },
    {
        timestamps: true,
    }
);

export const Role = model("Roles", roleSchema);
export const User = model<Users>("Users", userSchema);
