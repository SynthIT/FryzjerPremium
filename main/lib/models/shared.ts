import { Model, model, models, Schema, Types } from "mongoose";

import {
    Opinie,
    Media,
    SpecjalnaPromocja,
    Promos,
    Categories,
} from "../types/shared";

export const reviewProductSchema = new Schema<Opinie>(
    {
        uzytkownik: { type: String, required: true },
        tresc: { type: String },
        ocena: { type: Number, default: 0 },
        zweryfikowane: { type: Boolean },
    },
    { timestamps: true, optimisticConcurrency: true },
);

export const mediaProductSchema = new Schema<Media>(
    {
        nazwa: { type: String, required: true, min: 3, max: 25 },
        slug: { type: String, required: true },
        typ: { type: String, enum: ["video", "image", "pdf", "other"] },
        alt: { type: String, required: true },
        path: { type: String, required: true, unique: true },
    },
    {
        optimisticConcurrency: true,
        timestamps: true,
    },
);

export const specialPromoSchema = new Schema<SpecjalnaPromocja>({
    nazwa: { type: String, required: true, unique: true },
    warunek: { type: Number, required: true },
    obniza_cene: { type: Boolean },
    obnizka: { type: Number },
    zmienia_cene: { type: Boolean },
    nowa_cena: { type: Number },
});

export const promosSchema = new Schema<Promos>(
    {
        nazwa: { type: String, required: true, unique: true },
        procent: { type: Number, max: 100, min: 0, default: 0 },
        special: { type: specialPromoSchema },
        rozpoczecie: { type: Date, required: true },
        wygasa: { type: Date, required: true },
        aktywna: Boolean,
    },
    { optimisticConcurrency: true },
);

export const categoriesSchema = new Schema<Categories>(
    {
        nazwa: {
            type: String,
            required: true,
            default: "Brak nazwy",
            unique: true,
        },
        slug: { type: String, required: true },
        image: { type: String, required: true },
    },
    {
        optimisticConcurrency: true,
    },
);

export const Promo: Model<Promos> =
    (models.Promos as Model<Promos>) ?? model<Promos>("Promos", promosSchema);

export const Category: Model<Categories> =
    (models.Categories as Model<Categories>) ??
    model<Categories>("Categories", categoriesSchema);
