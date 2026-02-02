import { Model, model, models, Schema, Types } from "mongoose";
import { Courses, Firmy, KursWarianty } from "../types/coursesTypes.";
import { mediaProductSchema, reviewProductSchema } from "./shared";

const KursWariant = new Schema<KursWarianty>(
    {
        nazwa: { type: String, required: true },
        slug: { type: String, required: true },
        typ: {
            type: String,
            enum: ["wymiar", "okres", "dyplom", "specyfikacja"],
        },
        nadpisuje_cene: { type: Boolean },
        nowa_cena: { type: Number },
    },
    {
        autoIndex: false,
        optimisticConcurrency: true,
    },
);

const FirmaSchema = new Schema<Firmy>(
    {
        nazwa: { type: String, required: true },
        logo: { type: mediaProductSchema },
        opis: { type: String },
        slug: { type: String },
        strona_internetowa: { type: String },
    },
    {
        autoIndex: false,
        optimisticConcurrency: true,
    },
);

const courseSchema = new Schema<Courses>({
    slug: { type: String, required: true, unique: true },
    nazwa: { type: String, required: true, unique: true },
    cena: { type: Number, required: true },
    kategoria: {
        type: [Types.ObjectId],
        required: true,
        ref: "Categories",
    },
    firma: { type: Types.ObjectId, ref: "Firmy", required: true },
    media: { type: [mediaProductSchema], default: [] },
    promocje: { type: Types.ObjectId, ref: "Promos" },
    opis: { type: String, required: true },
    ocena: { type: Number, default: 0 },
    opinie: { type: [reviewProductSchema], default: [] },
    vat: { type: Number, required: true, default: 23 },
    wariant: { type: [KursWariant], default: [] },
    sku: { type: String },
    aktywne: { type: Boolean },
});

export const Course: Model<Courses> =
    (models.Courses as Model<Courses>) ??
    model<Courses>("Courses", courseSchema);
export const Firma: Model<Firmy> =
    (models.Firmy as Model<Firmy>) ?? model<Firmy>("Firmy", FirmaSchema);
