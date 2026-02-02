import { Model, model, models, Schema, Types } from "mongoose";
import { userPermission } from "../auth/permissions";
import { Producents, props, Warianty, Products } from "../types/productTypes";
import { mediaProductSchema, reviewProductSchema } from "./shared";


const producentsSchema = new Schema<Producents>(
    {
        nazwa: { type: String, required: true, unique: true },
        slug: String,
        strona_internetowa: String,
    },
    {
        optimisticConcurrency: true,
    },
);


const wariantPropsSchema = new Schema<props>(
    {
        name: { type: String, required: true },
        val: { type: String, required: true },
        hex: String,
    },
    { _id: false, optimisticConcurrency: true },
);

const wariantySchema = new Schema<Warianty>(
    {
        nazwa: { type: String, required: true },
        slug: { type: String, required: true },
        typ: {
            type: String,
            enum: ["kolor", "rozmiar", "objetosc", "specjalna", "hurt"],
        },
        kolory: { type: wariantPropsSchema },
        rozmiary: { type: wariantPropsSchema },
        objetosc: { type: Number },
        nadpisuje_cene: { type: Boolean },
        inna_cena_skupu: { type: Boolean },
        cena_skupu: { type: Number },
        permisje: { type: userPermission },
        nowa_cena: Number,
    },
    {
        optimisticConcurrency: true,
    },
);

export const productSchema = new Schema<Products>(
    {
        slug: { type: String, required: true, unique: true },
        nazwa: { type: String, required: true, unique: true },
        cena_skupu: { type: Number, required: true },
        cena: { type: Number, required: true },
        dostepnosc: { type: String, required: true },
        kategoria: {
            type: [Types.ObjectId],
            required: true,
            ref: "Categories",
        },
        producent: { type: Types.ObjectId, required: true, ref: "Producents" },
        media: { type: [mediaProductSchema], default: [] },
        promocje: { type: Types.ObjectId, ref: "Promos" },
        opis: { type: String, required: true },
        ilosc: { type: Number, min: 0, required: true, default: 0 },
        czas_wysylki: { type: Number, required: true, min: 1 },
        kod_produkcyjny: { type: String, required: true },
        ocena: { type: Number, required: true, default: 0 },
        opinie: { type: [reviewProductSchema], default: [] },
        vat: { type: Number, required: true, default: 23 },
        wariant: { type: [wariantySchema] },
        kod_ean: String,
        sku: String,
        aktywne: Boolean,
    },
    { timestamps: true, autoIndex: false, optimisticConcurrency: true },
);



export const Producent: Model<Producents> =
    (models.Producents as Model<Producents>) ??
    model<Producents>("Producents", producentsSchema);

export const Product: Model<Products> =
    (models.Products as Model<Products>) ??
    model<Products>("Products", productSchema);
