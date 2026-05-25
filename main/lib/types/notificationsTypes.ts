import z from "zod";

export const notificationsTypes = z.object({
    _id: z.string().optional(),
    nazwa: z.string(),
    typ: z.enum(["Konto do weryfikacji", "Mały stan towary", "Brak towaru", "Nowe zamówienie"]),
    tresc: z.string(),
    link: z.string().optional(),
    czy_przeczytane: z.boolean().default(false),
    czy_aktywne: z.boolean().default(true),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    __v: z.number().optional(),
});

export type notificationsType = z.infer<typeof notificationsTypes>;