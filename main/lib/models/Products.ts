import { Model, model, models, Schema, Types } from "mongoose";
import z from "zod";

export const zodWariantyProps = z.object({
    name: z.string(),
    val: z.string(),
    hex: z.string().nullable(),
});
export type props = z.infer<typeof zodWariantyProps>;

export const zodWarianty = z.object({
    nazwa: z.string(),
    slug: z.string(),
    typ: z.enum(["kolor", "rozmiar", "objetosc", "specjalna", "hurt"]),
    kolory: z.union([zodWariantyProps, z.null()]),
    rozmiary: z.union([zodWariantyProps, z.null()]),
    objetosc: z.number().nullable(),
    nadpisuje_cene: z.boolean().default(false),
    nowa_cena: z.number().nullable(),
});
export type Warianty = z.infer<typeof zodWarianty>;

export const PromocjeSchema = z.object({
    _id: z.string(),
    nazwa: z.string(),
    procent: z.number(),
    rozpoczecie: z.date(),
    wygasa: z.date(),
    aktywna: z.boolean().nullable(),
    __v: z.number(),
});
export type Promos = z.infer<typeof PromocjeSchema>;

export const zodOpinie = z.object({
    uzytkownik: z.string(),
    tresc: z.string(),
    ocena: z.number(),
    zweryfikowane: z.boolean().optional(),
    createdAt: z.date().optional(),
    editedAt: z.date().optional(),
});

export type Opinie = z.infer<typeof zodOpinie>;

export const zodMedia = z.object({
    nazwa: z.string(),
    slug: z.string(),
    typ: z.enum(["video", "image", "pdf", "other"]),
    alt: z.string(),
    path: z.string(),
});

export type Media = z.infer<typeof zodMedia>;

export const zodCategories = z.object({
    _id: z.string().optional(),
    nazwa: z.string(),
    slug: z.string(),
    image: z.string().optional(),
    __v: z.number().optional(),
});

export type Categories = z.infer<typeof zodCategories>;

export const zodProducents = z.object({
    _id: z.string().optional(),
    nazwa: z.string(),
    logo: zodMedia,
    opis: z.string().optional(),
    slug: z.string().nullable(),
    strona_internetowa: z.string().nullable(),
});

export type Producents = z.infer<typeof zodProducents>;

export const zodProducts = z.object({
    slug: z.string(),
    nazwa: z.string(),
    cena: z.number(),
    dostepnosc: z.string(),
    kategoria: z.array(
        z.union([z.instanceof(Types.ObjectId), zodCategories, z.string()])
    ),
    producent: z.union([
        z.instanceof(Types.ObjectId),
        zodProducents,
        z.string(),
    ]),
    media: z.array(zodMedia),
    promocje: z
        .union([z.instanceof(Types.ObjectId), PromocjeSchema, z.string()])
        .nullable(),
    opis: z.string(),
    ilosc: z.number(),
    czas_wysylki: z.number(),
    kod_produkcyjny: z.string(),
    ocena: z.number(),
    opinie: z.array(zodOpinie).nullable(),
    createdAt: z.date(),
    vat: z.number(),
    wariant: z.array(zodWarianty).optional(),
    kod_ean: z.string().nullable(),
    sku: z.string().nullable(),
    aktywne: z.boolean().nullable(),
});

export type Products = z.infer<typeof zodProducts>;

const reviewProductSchema = new Schema<Opinie>(
    {
        uzytkownik: { type: String, required: true },
        tresc: { type: String },
        ocena: { type: Number, default: 0 },
        zweryfikowane: { type: Boolean },
    },
    { timestamps: true, optimisticConcurrency: true }
);

const mediaProductSchema = new Schema<Media>(
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
    }
);

const producentsSchema = new Schema<Producents>(
    {
        nazwa: { type: String, required: true, unique: true },
        slug: String,
        strona_internetowa: String,
    },
    {
        optimisticConcurrency: true,
    }
);

const promosSchema = new Schema<Promos>(
    {
        nazwa: { type: String, required: true, unique: true },
        procent: { type: Number, required: true, max: 100, min: 0, default: 0 },
        rozpoczecie: { type: Date, required: true },
        wygasa: { type: Date, required: true },
        aktywna: Boolean,
    },
    { optimisticConcurrency: true }
);

const categoriesSchema = new Schema<Categories>(
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
    }
);

const wariantPropsSchema = new Schema<props>(
    {
        name: { type: String, required: true },
        val: { type: String, required: true },
        hex: String,
    },
    { _id: false, optimisticConcurrency: true }
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
        nowa_cena: Number,
    },
    {
        optimisticConcurrency: true,
    }
);

export const productSchema = new Schema<Products>(
    {
        slug: { type: String, required: true, unique: true },
        nazwa: { type: String, required: true, unique: true },
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
    { timestamps: true, autoIndex: false, optimisticConcurrency: true }
);

export const Promo: Model<Promos> =
    (models.Promos as Model<Promos>) ?? model<Promos>("Promos", promosSchema);

export const Category: Model<Categories> =
    (models.Categories as Model<Categories>) ??
    model<Categories>("Categories", categoriesSchema);

export const Producent: Model<Producents> =
    (models.Producents as Model<Producents>) ??
    model<Producents>("Producents", producentsSchema);

export const Product: Model<Products> =
    (models.Products as Model<Products>) ??
    model<Products>("Products", productSchema);
