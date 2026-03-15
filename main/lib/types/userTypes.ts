import zod from "zod";
import { adminPermission, userPermission } from "../auth/permissions";

export const zodLogin = zod.object({
    email: zod.email(),
    password: zod.string().min(1).max(20),
    refreshToken: zod.boolean().optional(),
});

export const roleSchema = zod.object({
    _id: zod.string().optional(),
    nazwa: zod.string(),
    admin: adminPermission.optional(),
    uzytkownik: userPermission.optional(),
    createdAt: zod.union([zod.date(), zod.string()]).optional(),
    updatedAt: zod.union([zod.date(), zod.string()]).optional(),
    __v: zod.number().optional(),
});

export const userSchema = zod.object({
    _id: zod.string().optional(),
    imie: zod.string(),
    nazwisko: zod.string(),
    email: zod.email(),
    haslo: zod.string(),
    nr_domu: zod.string(),
    nr_lokalu: zod.string().optional(),
    ulica: zod.string(),
    miasto: zod.string(),
    kraj: zod.string(),
    kod_pocztowy: zod.string(),
    telefon: zod.string(),
    osoba_prywatna: zod.boolean().default(true).optional(),
    nip: zod.string().optional(),
    faktura: zod.boolean().optional(),
    role: zod.array(zod.union([roleSchema, zod.string()])).optional(),
    stripe_id: zod.string().optional(),
    createdAt: zod.union([zod.date(), zod.string()]).optional(),
    updatedAt: zod.union([zod.date(), zod.string()]).optional(),
    __v: zod.number().optional(),
});

export type Users = zod.infer<typeof userSchema>;
export type Roles = zod.infer<typeof roleSchema>;

export {
    detailedOrderEntry,
    orderListSchema,
    type OrderList,
    type DetailedOrderEntry,
} from "./orderTypes";
