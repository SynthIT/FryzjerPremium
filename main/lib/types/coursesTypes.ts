import z from "zod";
import { zodPromocje, zodMedia, zodCategories, zodOpinie } from "./shared";
import { userSchema } from "./userTypes";

export const zodFirmy = z.object({
    _id: z.string().optional(),
    nazwa: z.string(),
    logo: zodMedia,
    instruktorzy: z.array(z.union([z.string(), userSchema])),
    prowizja: z.number().optional(),
    prowizja_typ: z.enum(["procent", "kwota"]).optional(),
    prowizja_vat: z.enum(["brutto", "netto"]).optional(),
    
    slug: z.string(),
    opis: z.string().optional(),
    strona_internetowa: z.string().nullable(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    __v: z.number().optional(),
});

export type Firmy = z.infer<typeof zodFirmy>;

export const zodLekcja = z.object({
    _id: z.string().optional(),
    tytul: z.string(),
    opis: z.string(),
    dlugosc: z.string(),
    video: z.string().optional(),
    plik: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    __v: z.number().optional(),
});

export type Lekcja = z.infer<typeof zodLekcja>;

export const zodCourses = z.object({
    slug: z.string(),
    nazwa: z.string(),
    cena: z.number(),
    prowizja: z.number().optional(),
    prowizja_typ: z.enum(["procent", "kwota"]).optional(),
    prowizja_vat: z.enum(["brutto", "netto"]).optional(),
    kategoria: z.array(
        z.union([z.string(), zodCategories]),
    ),
    lekcje: z.array(zodLekcja).optional(),
    firma: z.union([z.string(), zodFirmy]),
    media: z.array(zodMedia),
    promocje: z
        .union([z.string(), zodPromocje])
        .nullable(),
    opis: z.string(),
    ocena: z.number().optional().default(0),
    opinie: z.array(zodOpinie).nullable(),
    createdAt: z.date().optional(),
    vat: z.number().default(23),
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
