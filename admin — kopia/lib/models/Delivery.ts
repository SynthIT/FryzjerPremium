import { model, Schema } from "mongoose";

export interface DeliveryMethodsSizes {
    cena: number;
    wielkosci: string;
}

export interface DeliveryMethods {
    nazwa: string;
    slug: string;
    ceny: Array<DeliveryMethods>;
    firma: string;
    strona_internetowa: string;
}

const schemaDeliverySize = new Schema<DeliveryMethodsSizes>(
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

export const Delivery = model("Delivery", schemaDelivery);
