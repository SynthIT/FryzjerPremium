import { Model, model, models, Schema, Types } from "mongoose";
import { Courses, Firmy, Lekcja } from "../types/coursesTypes";
import { mediaProductSchema, reviewProductSchema } from "./shared";


const FirmaSchema = new Schema<Firmy>(
    {
        nazwa: { type: String, required: true },
        logo: { type: mediaProductSchema },
        opis: { type: String },
        instruktorzy: { type: [Types.ObjectId], ref: "Users", default: [] },
        slug: { type: String },
        strona_internetowa: { type: String },
    },
    {
        autoIndex: false,
        optimisticConcurrency: true,
    },
);

const LekcjaSchema = new Schema<Lekcja>(
    {
        tytul: { type: String, required: true },
        opis: { type: String, default: "" },
        dlugosc: { type: String, default: "" },
        rozdzial: { type: String },
        video: { type: String },
        plik: { type: String },
    },
    {
        autoIndex: false,
        optimisticConcurrency: true,
    },
);

const courseSchema = new Schema<Courses>(
    {
        slug: { type: String, required: true, unique: true },
        nazwa: { type: String, required: true, unique: true },
        cena: { type: Number, required: true },
        prowizja: { type: Number },
        prowizja_typ: { type: String, enum: ["procent", "kwota"] },
        prowizja_vat: { type: String, enum: ["brutto", "netto"] },
        kategoria: {
            type: [Types.ObjectId],
            required: true,
            ref: "Categories",
        },
        lekcje: { type: [LekcjaSchema], default: [] },
        firma: { type: Types.ObjectId, ref: "Firmy", required: true },
        media: { type: [mediaProductSchema], default: [] },
        promocje: { type: Types.ObjectId, ref: "Promos" },
        opis: { type: String, required: true },
        ocena: { type: Number, default: 0 },
        opinie: { type: [reviewProductSchema], default: [] },
        vat: { type: Number, required: true, default: 23 },
        sku: { type: String },
        liczbaZapisanych: { type: Number, default: 0 },
        czegoSieNauczysz: { type: [String], default: [] },
        gwarancjaDni: { type: Number, default: 0 },
        zawartoscKursu: { type: [String], default: [] },
        wymagania: { type: [String], default: [] },
        dozywotniDostep: { type: Boolean },
        materialyDoPobrania: { type: Boolean },
        aktywne: { type: Boolean },
        // Pola specyficzne dla szkoleń (opcjonalne - nie zepsują istniejących danych)
        czasTrwania: { type: String },
        poziom: { type: String },
        liczbaLekcji: { type: Number },
        instruktor: { type: String },
        jezyk: { type: String, default: "polski" },
        certyfikat: { type: Boolean, default: false },
        krotkiOpis: { type: String }, // Krótki opis/subtitle
    },
    { autoIndex: false },
);

export const Course: Model<Courses> =
    (models.Courses as Model<Courses>) ??
    model<Courses>("Courses", courseSchema);
export const Firma: Model<Firmy> =
    (models.Firmy as Model<Firmy>) ?? model<Firmy>("Firmy", FirmaSchema);
