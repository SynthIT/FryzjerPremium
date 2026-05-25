import z from "zod";


export const zodAnalist = z.object({
    _id: z.string().optional(),
    sku: z.string(),
    nazwa: z.string(),
    wariant: z.string(),
    cena_skupu: z.number(),
    cena: z.number(),
    ilosc: z.number(),
    delta: z.number(),
    kod_produkcyjny: z.string().optional(),
    kod_ean: z.string().optional(),
    pop_cena: z.number().optional(),
    pop_cena_skupu: z.number().optional(),
    pop_ilosc: z.number().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    __V: z.number().optional(),
});

export type Analist = z.infer<typeof zodAnalist>;
