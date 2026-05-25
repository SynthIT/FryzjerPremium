import z from "zod";

export const AccountVerifySchema = z.object({
    _id: z.string().optional(),
    email: z.email(),
    nazwa: z.string(),
    rodzaj_firmy: z.enum(["JDG", "SP. K.A.", "OSOBOWA", "JAWNA", "SPOLKA AKCYJNA", "SPOLKA Z OGRANICZONA ODPOWIEDZIALNOSC"]),
    strona_internetowa: z.string().optional(),
    adres: z.string().optional(),
    miasto: z.string().optional(),
    kod_pocztowy: z.string().optional(),
    kraj: z.string().optional(),
    nip: z.string().optional(),
    krs: z.string().optional(),
    regon: z.string().optional(),
    e_mail: z.email().optional(),
    telefon: z.string().optional(),
    fax: z.string().optional(),
    www: z.string().optional(),
    nrtel: z.string().optional(),
    nrtel2: z.string().optional(),
    numer_telefonu: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    __v: z.number().optional(),
});

export type AccountVerify = z.infer<typeof AccountVerifySchema>;