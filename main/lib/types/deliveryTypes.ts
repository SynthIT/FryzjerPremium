import { z } from "zod";

export const zodDeliveryMethodsSizes = z.object({
    cena: z.number(),
    wielkosci: z.string(),
    wysokosc: z.number(),
    szerokosc: z.number(),
    dlugosc: z.number(),
});

export const zodDeliveryMethods = z.object({
    nazwa: z.string(),
    slug: z.string(),
    rozmiary: z.array(zodDeliveryMethodsSizes),
    czas_dostawy: z.string(),
    darmowa_dostawa: z.boolean().default(false),
    kwota_darmowa: z.number(),
    firma: z.string(),
    strona_internetowa: z.string(),
});


export type DeliveryMethods = z.infer<typeof zodDeliveryMethods>;
export type DeliveryMethodsSizes = z.infer<typeof zodDeliveryMethodsSizes>;
