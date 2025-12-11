import { Document, model, Schema, Types } from "mongoose";

export type WariantyTyp = "kolor" | "rozmiar" | "objetosc";
export type MediaTyp = "video" | "image" | "pdf" | "other";

export interface Products {
    slug: string;
    nazwa: string;
    cena: number;
    dostepnosc: string;
    kategoria: Categories[] | Types.ObjectId[] | string[];
    producent: Producents | Types.ObjectId | string;
    media: Media[];
    promocje: Promos | Types.ObjectId | string | null;
    opis: string;
    ilosc: number;
    czas_wysylki: number;
    kod_produkcyjny: string;
    ocena: number;
    opinie: Opinie[] | null;
    createdAt: Date;
    wariant?: Warianty[];
    kod_ean?: string | null;
    sku?: string | null;
    aktywne?: boolean | null;
}

export interface Opinie {
    uzytkownik: string;
    tresc: string;
    ocena: number;
    zweryfikowane?: boolean;
    createdAt?: Date;
    editedAt?: Date;
}

export interface Warianty {
    nazwa: string;
    slug: string;
    typ: WariantyTyp;
    kolory?: props;
    rozmiary?: props;
    objetosc?: number;
    nadpisuje_cene?: boolean | null;
    nowa_cena?: number | null;
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
    slug: string;
    image: string;
}

export interface Producents {
    nazwa: string;
    slug?: string | null;
    strona_internetowa?: string | null;
}

export interface Media {
    nazwa: string;
    slug: string;
    typ: MediaTyp;
    alt: string;
    path: string;
}

export interface props {
    name: string;
    val: string;
    hex?: string;
}

const reviewProductSchema = new Schema<Opinie>(
    {
        uzytkownik: { type: String, required: true },
        tresc: { type: String },
        ocena: { type: Number, default: 0 },
        zweryfikowane: { type: Boolean },
    },
    { timestamps: true }
);

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
    slug: { type: String, required: true },
    image: { type: String, required: true },
});

const wariantPropsSchema = new Schema(
    {
        name: { type: String, required: true },
        val: { type: String, required: true },
        hex: String,
    },
    { _id: false }
);

const wariantySchema = new Schema({
    nazwa: { type: String, required: true },
    slug: { type: String, required: true },
    typ: { type: String, enum: ["kolor", "rozmiar", "objetosc"] },
    kolor: { type: wariantPropsSchema },
    rozmiary: { type: wariantPropsSchema },
    objetosc: { type: Number },
    nadpisuje_cene: { type: Boolean },
    nowa_cena: Number,
});

export const productSchema = new Schema<Products>(
    {
        slug: { type: String, required: true, unique: true },
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
        ocena: { type: Number, required: true, default: 0 },
        opinie: { type: [reviewProductSchema], default: [] },
        wariant: { type: [wariantySchema] },
        kod_ean: String,
        sku: String,
        aktywne: Boolean,
    },
    { timestamps: true, autoIndex: false }
);

export const Promo = model<Promos>("promos", promosSchema);
export const Category = model<Categories>("categories", categoriesSchema);
export const Producent = model<Producents>("producents", producentsSchema);
export const Product = model<Products>("products", productSchema);
