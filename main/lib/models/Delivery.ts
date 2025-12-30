import { model, models, Schema } from "mongoose";
import { z } from 'zod';

export const schemaDeliverySize = new Schema<DeliveryMethodsSizes>(
    {
        cena: { type: Number, required: true },
        wielkosci: { type: String, required: true },
    },
    { autoIndex: false }
);

export const schemaDelivery = new Schema<DeliveryMethods>(
    {
        nazwa: { type: String, required: true, default: "" },
        slug: { type: String },
        ceny: { type: [schemaDeliverySize], required: true },
        firma: { type: String, required: true },
        strona_internetowa: { type: String, required: true },
    },
    { autoIndex: false }
);

export const Delivery = models.Delivery ?? model("Delivery", schemaDelivery);

export const zodDeliveryMethodsSizes = z.object({
    cena: z.number(),
    wielkosci: z.string(),
});

export type DeliveryMethodsSizes = z.infer<typeof zodDeliveryMethodsSizes>;

export const zodDeliveryMethods = z.object({
    nazwa: z.string(),
    slug: z.string(),
    ceny: z.array(zodDeliveryMethodsSizes),
    firma: z.string(),
    strona_internetowa: z.string(),
});

export type DeliveryMethods = z.infer<typeof zodDeliveryMethods>;
