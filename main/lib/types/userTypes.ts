import zod from "zod";
import { adminPermission, userPermission } from "../auth/permissions";
import { zodDeliveryMethods } from "./deliveryTypes";
import { zodCartItem } from "./cartTypes";

export const roleSchema = zod.object({
    _id: zod.string().optional(),
    nazwa: zod.string(),
    admin: adminPermission.optional(),
    uzytkownik: userPermission.optional(),
    createdAt: zod.date().optional(),
    updatedAt: zod.date().optional(),
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
    createdAt: zod.date().optional(),
    updatedAt: zod.date().optional(),
    __v: zod.number().optional(),
});

export const orderListSchema = zod.object({
    _id: zod.string().optional(),
    user: zod.union([zod.string(), userSchema]),
    email: zod.string(),
    status: zod
        .enum(["w_koszyku", "nowe", "w_realizacji", "wyslane", "zrealizowane", "anulowane"])
        .default("w_koszyku"),
    numer_zamowienia: zod.string(),
    sposob_dostawy: zod.union([
        zod.lazy(() => zodDeliveryMethods),
        zod.string(),
    ]),
    produkty: zod.array(zod.union([zod.string(), zodCartItem])),
    suma: zod.number(),
    data_zamowienia: zod.date().optional(),
    data_wyslania: zod.date().optional(),
    data_zrealizowania: zod.date().optional(),
    data_anulowania: zod.date().optional(),
    createdAt: zod.date().optional(),
    updatedAt: zod.date().optional(),
    __v: zod.number().optional(),
});

export type Users = zod.infer<typeof userSchema>;
export type Roles = zod.infer<typeof roleSchema>;
export type OrderList = zod.infer<typeof orderListSchema>;
