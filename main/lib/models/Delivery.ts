import { Model, model, models, Schema } from "mongoose";
import { DeliveryMethods, DeliveryMethodsSizes } from "../types/deliveryTypes";

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
        czas_dostawy: { type: String, required: true },
        darmowa_dostawa: { type: Boolean, required: true, default: false },
        kwota_darmowa: { type: Number },
        firma: { type: String, required: true },
        strona_internetowa: { type: String, required: true },
    },
    { autoIndex: false }
);

export const Delivery: Model<DeliveryMethods> =
    (models.Delivery as Model<DeliveryMethods>) ??
    model<DeliveryMethods>("Delivery", schemaDelivery);
