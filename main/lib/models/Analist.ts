import { Model, model, models, Schema } from "mongoose";
import { Analist } from "../types/analistTypes";

export const analistSchema = new Schema<Analist>(
    {
        sku: { type: String, required: true, unique: true },
        nazwa: { type: String, required: true },
        cena_skupu: { type: Number, required: true },
        cena: { type: Number, required: true },
        ilosc: { type: Number, required: true },
        profit: { type: Number, default: 0 },
        pop_cena_skupu: { type: Number, default: 0 },
        pop_cena: { type: Number, default: 0 },
        pop_ilosc: { type: Number, default: 0 },
        pop_profit: { type: Number, default: 0 },
    },
    { autoIndex: false, timestamps: true },
);

export const Analistics: Model<Analist> =
    (models.Analistics as Model<Analist>) ??
    model<Analist>("Analistics", analistSchema);
