import { Model, model, models, Schema } from "mongoose";
import { Analist } from "../types/analistTypes";

export const analistSchema = new Schema<Analist>(
    {
        sku: { type: String, required: true },
        kod_produkcyjny: { type: String, },
        kod_ean: { type: String, },
        nazwa: { type: String, required: true },
        wariant: { type: String, required: true },
        cena_skupu: { type: Number, required: true },
        cena: { type: Number, required: true },
        ilosc: { type: Number, required: true },
        delta: { type: Number, required: true },
        pop_cena: { type: Number, },
        pop_cena_skupu: { type: Number, },
        pop_ilosc: { type: Number, },
    },
    { autoIndex: false, timestamps: true, },
);

export const Analistics: Model<Analist> =
    (models.Analistics as Model<Analist>) ??
    model<Analist>("Analistics", analistSchema);
