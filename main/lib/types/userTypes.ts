import zod from "zod";
import { adminPermission, userPermission } from "../auth/permissions";
import { zodDeliveryMethods } from "./deliveryTypes";

export const orderListSchema = zod.object({
    status: zod
        .enum(["w_koszyku", "nowe", "w_realizacji", "wyslane", "zrealizowane", "anulowane"])
        .default("nowe"),
    numer_zamowienia: zod.string(),
    sposob_dostawy: zod.union([
        zod.lazy(() => zodDeliveryMethods),
        zod.string(),
    ]),
    produkty: zod.array(zod.union([zod.string(), zod.string()])),
    suma: zod.number(),
    data_zamowienia: zod.date(),
    data_wyslania: zod.date().optional(),
    data_zrealizowania: zod.date().optional(),
    data_anulowania: zod.date().optional(),
    createdAt: zod.date().optional(),
    updatedAt: zod.date().optional(),
    __v: zod.number().optional(),
});

export const roleSchema = zod.object({
    nazwa: zod.string(),
    admin: adminPermission.optional(),
    uzytkownik: userPermission.optional(),
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
    zamowienia: zod
        .array(zod.union([zod.string(), orderListSchema]))
        .optional(),
    nip: zod.string().optional(),
    faktura: zod.boolean().optional(),
    role: zod.array(zod.union([roleSchema, zod.string()])).optional(),
    stripe_id: zod.string().optional(),
});

export type Users = zod.infer<typeof userSchema>;
export type Roles = zod.infer<typeof roleSchema>;
export type OrderList = zod.infer<typeof orderListSchema>;
