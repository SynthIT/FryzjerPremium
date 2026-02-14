import z from "zod";

export const keys = [
    "sku",
    "nazwa",
    "cena_skupu",
    "cena",
    "ilosc",
    "pop_cena_skupu",
    "pop_cena",
    "pop_ilosc",
    "pop_profit",
] as const;

export const zodAnalist = z.object({
    _id: z.string().optional(),
    sku: z.string(),
    nazwa: z.string(),
    cena_skupu: z.number(),
    cena: z.number(),
    ilosc: z.number(),
    profit: z.number().default(0),
    pop_cena_skupu: z.number().optional().default(0),
    pop_cena: z.number().optional().default(0),
    pop_ilosc: z.number().optional().default(0),
    pop_profit: z.number().optional().default(0),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    __V: z.number().optional(),
});

export type Analist = z.infer<typeof zodAnalist>;
