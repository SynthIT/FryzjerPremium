import z from "zod";
import { zodPromocje, zodMedia, zodCategories, zodOpinie } from "./shared";
import { Types } from "mongoose";

export const zodKursWarianty = z.object({
    nazwa: z.string(),
    slug: z.string(),
    typ: z.enum(["wymiar", "okres", "dyplom", "specyfikacja"]),
    nadpisuje_cene: z.boolean().default(false),
    nowa_cena: z.number().optional(),
});
export type KursWarianty = z.infer<typeof zodKursWarianty>;

export const zodFirmy = z.object({
    _id: z.instanceof(Types.ObjectId).optional(),
    nazwa: z.string(),
    logo: zodMedia,
    opis: z.string().optional(),
    slug: z.string().nullable(),
    strona_internetowa: z.string().nullable(),
});

export type Firmy = z.infer<typeof zodFirmy>;

export const zodCourses = z.object({
    slug: z.string(),
    nazwa: z.string(),
    cena: z.number(),
    kategoria: z.array(
        z.union([z.instanceof(Types.ObjectId), zodCategories, z.string()]),
    ),
    firma: z.union([z.instanceof(Types.ObjectId), zodFirmy, z.string()]),
    media: z.array(zodMedia),
    promocje: z
        .union([z.instanceof(Types.ObjectId), zodPromocje, z.string()])
        .nullable(),
    opis: z.string(),
    ocena: z.number(),
    opinie: z.array(zodOpinie).nullable(),
    createdAt: z.date().optional(),
    vat: z.number().default(23),
    wariant: z.array(zodKursWarianty).optional(),
    sku: z.string().nullable(),
    aktywne: z.boolean().nullable(),
    // Pola specyficzne dla szkoleń (opcjonalne, żeby nie zepsuć istniejących danych)
    czasTrwania: z.string().optional(),
    poziom: z.string().optional(),
    liczbaLekcji: z.number().optional(),
    instruktor: z.string().optional(),
    jezyk: z.string().optional(),
    certyfikat: z.boolean().optional(),
    krotkiOpis: z.string().optional(), // Krótki opis/subtitle
});

export type Courses = z.infer<typeof zodCourses>;
