import { HydratedDocument, model, Schema, Types, models } from "mongoose";
import db from "../db";

async () => {
    await db();
};

export interface Products {
    nazwa: string;
    cena: number;
    dostepnosc: string;
    kategoria: Categories[] | Types.ObjectId | string;
    producent: Producents | Types.ObjectId | string;
    media: Media[];
    promocje: Promos | Types.ObjectId | null;
    opis: string;
    ilosc: number;
    czas_wysylki: number;
    kod_produkcyjny: string;
    kod_ean?: string | null;
    sku?: string | null;
    aktywne?: boolean | null;
}

export interface Promos {
    nazwa: string;
    procent: number;
    rozpoczecie: Date;
    wygasa: Date;
    aktywna?: boolean | null;
    stworzonie?: Date | null;
}

export interface Categories {
    nazwa: string;
    slug?: string | null;
}

export interface Producents {
    nazwa: string;
    slug?: string | null;
    strona_internetowa?: string | null;
}

export interface Media {
    nazwa: string;
    slug: string;
    typ: "video" | "image" | "pdf" | "other";
    alt: string;
    path: string;
}

const mediaProductSchema = new Schema(
    {
        nazwa: { type: String, required: true, min: 3, max: 25 },
        slug: { type: String, required: true },
        typ: { type: String, enum: ["video", "image", "pdf", "other"] },
        alt: { type: String, required: true },
        path: { type: String, required: true, unique: true },
    },
    {
        timestamps: true,
    }
);

const producentsSchema = new Schema<Producents>({
    nazwa: { type: String, required: true, unique: true },
    slug: String,
    strona_internetowa: String,
});

const promosSchema = new Schema<Promos>({
    nazwa: { type: String, required: true, unique: true },
    procent: { type: Number, required: true, max: 100, min: 0, default: 0 },
    rozpoczecie: { type: Date, required: true },
    wygasa: { type: Date, required: true },
    aktywna: Boolean,
    stworzonie: Date,
});

const categoriesSchema = new Schema<Categories>({
    nazwa: {
        type: String,
        required: true,
        default: "Brak nazwy",
        unique: true,
    },
    slug: String,
});

const productSchema = new Schema<Products>(
    {
        nazwa: { type: String, required: true, unique: true },
        cena: { type: Number, required: true },
        dostepnosc: { type: String, required: true },
        kategoria: {
            type: [Types.ObjectId],
            required: true,
            ref: "categories",
        },
        producent: { type: Types.ObjectId, required: true, ref: "producents" },
        media: { type: [mediaProductSchema], default: [] },
        promocje: { type: Types.ObjectId, ref: "promos" },
        opis: { type: String, required: true },
        ilosc: { type: Number, min: 0, required: true, default: 0 },
        czas_wysylki: { type: Number, required: true, min: 1 },
        kod_produkcyjny: { type: String, required: true },
        kod_ean: String,
        sku: String,
        aktywne: Boolean,
    },
    { timestamps: true }
);

export const Promo = model<Promos>("promos", promosSchema);
export const Category = model<Categories>("categories", categoriesSchema);
export const Producent = model<Producents>("producents", producentsSchema);
export const Product = model<Products>("products", productSchema);
