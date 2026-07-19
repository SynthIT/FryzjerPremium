import z from "zod";
import { userPermission } from "../auth/permissions";
import { zodCategories, zodMedia, zodOpinie, zodPromocje } from "./shared";

export const zodWariantyProps = z.object({
    name: z.string(),
    val: z.string(),
    hex: z.string().nullable().optional(),
});
export type props = z.infer<typeof zodWariantyProps>;

export const zodSpecyfikacja = z.object({
    key: z.string(),
    value: z.string(),
});

export const zodWarianty = z.object({
    _id: z.string().optional(),
    nazwa: z.string(),
    slug: z.string(),
    typ: z.enum(["kolor", "rozmiar", "objetosc", "specjalna", "hurt"]),
    ilosc: z.number(),
    kolory: zodWariantyProps.optional(),
    rozmiary: zodWariantyProps.optional(),
    objetosc: z.number().optional(),
    nadpisuje_cene: z.boolean().default(false),
    inna_cena_skupu: z.boolean().default(false),
    cena_skupu: z.number().optional(),
    nowa_cena: z.number().optional(),
    specyfikacja: z.array(zodSpecyfikacja).nullable().optional(),
    permisje: userPermission.optional(),
});
export type Warianty = z.infer<typeof zodWarianty>;

export const zodProducents = z.object({
    _id: z.string().optional(),
    nazwa: z.string(),
    logo: zodMedia,
    slug: z.string(),
    opis: z.string().optional(),
    strona_internetowa: z.string().nullable(),
});

export type Producents = z.infer<typeof zodProducents>;

export const zodProducts = z.object({
    _id: z.string().optional(),
    slug: z.string(),
    nazwa: z.string(),
    cena_skupu: z.number(),
    cena: z.number(),
    dostepnosc: z.string(),
    kategoria: z.array(
        z.union([z.string(), zodCategories]),
    ),
    producent: z.union([
        z.string(),
        zodProducents,
    ]),
    media: z.array(zodMedia),
    promocje: z
        .union([z.string(), zodPromocje, z.null()]).nullable().optional(),
    specyfikacja: z.array(zodSpecyfikacja).nullable().optional(),
    /** Paczka Apaczka — obligatoryjne (cm / kg) */
    szerokosc: z.number().positive({ message: "Szerokość (X) musi być > 0" }),
    wysokosc: z.number().positive({ message: "Wysokość (Y) musi być > 0" }),
    dlugosc: z.number().positive({ message: "Długość (Z) musi być > 0" }),
    waga: z.number().positive({ message: "Waga musi być > 0" }),
    opis: z.string(),
    ilosc: z.number(),
    czas_wysylki: z.number(),
    ocena: z.number(),
    opinie: z.array(zodOpinie).nullable(),
    vat: z.number().default(23),
    sku: z.string(),
    kod_produkcyjny: z.string(),
    kod_ean: z.string().nullable(),
    wariant: z.array(zodWarianty).nullable().optional(),
    aktywne: z.boolean().nullable(),
    __v: z.number().optional(),
    createdAt: z.union([z.date(), z.string()]).optional(),
    updatedAt: z.union([z.date(), z.string()]).optional(),
});

export type Products = z.infer<typeof zodProducts>;
