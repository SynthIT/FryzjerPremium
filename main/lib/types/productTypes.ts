import z from "zod";
import { userPermission } from "../auth/permissions";
import { zodCategories, zodMedia, zodOpinie, zodPromocje } from "./shared";
import { Types } from "mongoose";

export const zodWariantyProps = z.object({
    name: z.string(),
    val: z.string(),
    hex: z.string().nullable(),
});
export type props = z.infer<typeof zodWariantyProps>;

export const zodWarianty = z.object({
    nazwa: z.string(),
    slug: z.string(),
    typ: z.enum(["kolor", "rozmiar", "objetosc", "specjalna", "hurt"]),
    kolory: zodWariantyProps.optional(),
    rozmiary: zodWariantyProps.optional(),
    objetosc: z.number().optional(),
    nadpisuje_cene: z.boolean().default(false),
    inna_cena_skupu: z.boolean().default(false),
    cena_skupu: z.number().optional(),
    permisje: userPermission.optional(),
    nowa_cena: z.number().optional(),
});
export type Warianty = z.infer<typeof zodWarianty>;

export const zodProducents = z.object({
    _id: z.instanceof(Types.ObjectId).optional(),
    nazwa: z.string(),
    logo: zodMedia,
    slug: z.string(),
    opis: z.string().optional(),
    strona_internetowa: z.string().nullable(),
});

export type Producents = z.infer<typeof zodProducents>;

export const zodSpecyfikacja = z.object({
    key: z.string(),
    value: z.string(),
});

export const zodProducts = z.object({
    slug: z.string(),
    nazwa: z.string(),
    cena_skupu: z.number(),
    cena: z.number(),
    dostepnosc: z.string(),
    kategoria: z.array(
        z.union([z.instanceof(Types.ObjectId), zodCategories, z.string()]),
    ),
    producent: z.union([
        z.instanceof(Types.ObjectId),
        zodProducents,
        z.string(),
    ]),
    media: z.array(zodMedia),
    promocje: z
        .union([z.instanceof(Types.ObjectId), zodPromocje, z.string()])
        .nullable(),
    specyfikacja: z.array(zodSpecyfikacja).optional(),
    opis: z.string(),
    ilosc: z.number(),
    czas_wysylki: z.number(),
    kod_produkcyjny: z.string(),
    ocena: z.number(),
    opinie: z.array(zodOpinie).nullable(),
    createdAt: z.date().optional(),
    vat: z.number().default(23),
    wariant: z.array(zodWarianty).optional(),
    kod_ean: z.string().nullable(),
    sku: z.string().nullable(),
    aktywne: z.boolean().nullable(),
});

export type Products = z.infer<typeof zodProducts>;
