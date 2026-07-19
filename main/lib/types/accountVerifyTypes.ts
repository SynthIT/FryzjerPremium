import z from "zod";

export const accountVerifyStatus = z.enum([
    "oczekujace",
    "zaakceptowane",
    "odrzucone",
]);
export type AccountVerifyStatus = z.infer<typeof accountVerifyStatus>;

export const accountVerifyStatusLabels: Record<AccountVerifyStatus, string> = {
    oczekujace: "Oczekujące",
    zaakceptowane: "Zaakceptowane",
    odrzucone: "Odrzucone",
};

export const RODZAJE_FIRMY = [
    "JDG",
    "SP. K.A.",
    "OSOBOWA",
    "JAWNA",
    "SPOLKA AKCYJNA",
    "SPOLKA Z OGRANICZONA ODPOWIEDZIALNOSC",
] as const;

export const AccountVerifySchema = z.object({
    _id: z.string().optional(),
    userId: z.string().optional(),
    email: z.email(),
    nazwa: z.string().min(1),
    rodzaj_firmy: z.enum(RODZAJE_FIRMY),
    strona_internetowa: z.string().optional(),
    adres: z.string().optional(),
    miasto: z.string().optional(),
    kod_pocztowy: z.string().optional(),
    kraj: z.string().optional(),
    nip: z.string().min(1),
    krs: z.string().optional(),
    regon: z.string().optional(),
    e_mail: z.email().optional(),
    telefon: z.string().optional(),
    fax: z.string().optional(),
    www: z.string().optional(),
    nrtel: z.string().optional(),
    nrtel2: z.string().optional(),
    numer_telefonu: z.string().optional(),
    status: accountVerifyStatus.default("oczekujace"),
    powod_odrzucenia: z.string().optional(),
    reviewedAt: z.union([z.date(), z.string()]).optional(),
    createdAt: z.union([z.date(), z.string()]).optional(),
    updatedAt: z.union([z.date(), z.string()]).optional(),
    __v: z.number().optional(),
});

export type AccountVerify = z.infer<typeof AccountVerifySchema>;

/** Payload użytkownika przy składaniu wniosku (bez pól admina). */
export const AccountVerifySubmitSchema = AccountVerifySchema.pick({
    nazwa: true,
    rodzaj_firmy: true,
    nip: true,
    regon: true,
    krs: true,
    adres: true,
    miasto: true,
    kod_pocztowy: true,
    kraj: true,
    telefon: true,
    strona_internetowa: true,
});
