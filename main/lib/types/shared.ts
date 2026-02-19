import z from "zod";

export const zodSpecjalnePromocja = z.object({
    nazwa: z.string(),
    warunek: z.number(),
    obniza_cene: z.boolean().default(false),
    obnizka: z.number().optional(),
    zmienia_cene: z.boolean().default(false),
    nowa_cena: z.number().optional(),
});
export type SpecjalnaPromocja = z.infer<typeof zodSpecjalnePromocja>;

export const zodPromocje = z.object({
    _id: z.string().optional(),
    nazwa: z.string(),
    procent: z.number().optional(),
    special: zodSpecjalnePromocja.optional(),
    rozpoczecie: z.date(),
    wygasa: z.date(),
    aktywna: z.boolean().nullable(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    __v: z.number().optional(),
});
export type Promos = z.infer<typeof zodPromocje>;

export const zodOpinie = z.object({
    uzytkownik: z.string(),
    tresc: z.string(),
    ocena: z.number(),
    zweryfikowane: z.boolean().optional(),
    createdAt: z.date().optional(),
    editedAt: z.date().optional(),
});

export type Opinie = z.infer<typeof zodOpinie>;

export const zodMedia = z.object({
    nazwa: z.string(),
    slug: z.string(),
    typ: z.enum(["video", "image", "pdf", "other"]),
    alt: z.string(),
    path: z.string(),
});

export type Media = z.infer<typeof zodMedia>;

export const zodCategories = z.object({
    _id: z.string().optional(),
    nazwa: z.string(),
    slug: z.string(),
    kategoria: z.string(),
    type: z.enum(["product", "course"]),
    image: zodMedia.optional(),
    __v: z.number().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export type Categories = z.infer<typeof zodCategories>;
