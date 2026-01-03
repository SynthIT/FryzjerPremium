import { z } from "zod";

export const zodDeliveryMethodsSizes = z.object({
    cena: z.number(),
    wielkosci: z.string(),
});

export const zodDeliveryMethods = z.object({
    nazwa: z.string(),
    slug: z.string(),
    ceny: z.array(zodDeliveryMethodsSizes),
    czas_dostawy: z.string(),
    darmowa_dostawa: z.boolean().default(false),
    kwota_darmowa: z.number(),
    firma: z.string(),
    strona_internetowa: z.string(),
});

export const orderListSchema = z.object({
    numer_zamowienia: z.string(),
    sposob_dostawy: z.union([
        z.string(),
        z.lazy(() => zodDeliveryMethods),
        z.string(),
    ]),
    produkty: z.array(z.union([z.string(), z.string()])),
    suma: z.number(),
    data_wykonania: z.date(),
});

export type DeliveryMethods = z.infer<typeof zodDeliveryMethods>;
export type DeliveryMethodsSizes = z.infer<typeof zodDeliveryMethodsSizes>;
