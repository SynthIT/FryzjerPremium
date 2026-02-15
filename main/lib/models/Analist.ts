import { Model, model, models, Schema } from "mongoose";
import { Analist } from "../types/analistTypes";

export const analistSchema = new Schema<Analist>(
    {
        sku: { type: String, required: true },
        nazwa: { type: String, required: true },
        wariant: { type: String, required: true },
        cena_skupu: { type: Number, required: true },
        cena: { type: Number, required: true },
        ilosc: { type: Number, required: true },
    },
    { autoIndex: false, timestamps: true, },
);

export const Analistics: Model<Analist> =
    (models.Analistics as Model<Analist>) ??
    model<Analist>("Analistics", analistSchema);
