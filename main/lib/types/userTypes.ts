import zod from "zod";
import { adminPermission, userPermission } from "../auth/permissions";

export const roleSchema = zod.object({
    _id: zod.string().nullable(),
    nazwa: zod.string(),
    admin: adminPermission.optional(),
    uzytkownik: userPermission.optional(),
});

export const deliveryMethodsSchema = zod.object({
    nazwa: zod.string(),
    slug: zod.string(),
    ceny: zod.array(
        zod.object({
            cena: zod.number(),
            wielkosci: zod.string(),
        })
    ),
    firma: zod.string(),
    strona_internetowa: zod.string(),
});

export const orderListSchema = zod.object({
    numer_zamowienia: zod.string(),
    sposob_dostawy: zod.union([
        zod.string(),
        zod.lazy(() => deliveryMethodsSchema),
        zod.string(),
    ]),
    produkty: zod.array(zod.union([zod.string(), zod.string()])),
    suma: zod.number(),
    data_wykonania: zod.date(),
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
    osoba_prywatna: zod.boolean().default(true),
    zamowienia: zod
        .array(zod.union([zod.string(), zod.lazy(() => orderListSchema)]))
        .optional(),
    nip: zod.string().optional(),
    faktura: zod.boolean().optional(),
    role: zod
        .union([zod.array(roleSchema), zod.array(zod.string())])
        .optional(),
});

export type Users = zod.infer<typeof userSchema>;
export type Roles = zod.infer<typeof roleSchema>;
export type OrderList = zod.infer<typeof orderListSchema>;
export type DeliveryMethods = zod.infer<typeof deliveryMethodsSchema>;
export type DeliveryMethodsSizes = zod.infer<
    typeof deliveryMethodsSchema.shape.ceny.element
>;
