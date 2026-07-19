import { Model, model, models, Schema, Types } from "mongoose";
import { Users, Roles, OrderList, DetailedOrderEntry, VerifyEmail } from "../types/userTypes";
import { CorrectionEntry, FileOrderEntry } from "../types/orderTypes";

export const correctionEntrySchema = new Schema<CorrectionEntry>({
    ilosc: { type: Number, required: true },
    reason: { type: String, required: true },
}, { _id: false, optimisticConcurrency: true, timestamps: false, autoIndex: false });

export const detailedCourseOrderEntrySchema = new Schema<DetailedOrderEntry>({
    ilosc: { type: Number, required: true },
    cena: { type: Number, required: true },
    koretka: { type: correctionEntrySchema },
    pozycja: { type: Types.ObjectId, ref: "Courses" },
}, { _id: false, optimisticConcurrency: true, timestamps: false, autoIndex: false });

export const detailedProductOrderEntrySchema = new Schema<DetailedOrderEntry>({
    ilosc: { type: Number, required: true },
    cena: { type: Number, required: true },
    pozycja: { type: Types.ObjectId, ref: "Products" },
    wariant: { type: String },
}, { _id: false, optimisticConcurrency: true, timestamps: false, autoIndex: false });

const roleSchemat = new Schema<Roles>(
    {
        nazwa: { type: String, required: true, unique: true },
        uzytkownik: { type: Number, default: 0 },
        admin: { type: Number, default: 0 },
    },
    { timestamps: true, },
);

const userSchemat = new Schema<Users>(
    {

        imie: { type: String, required: true },
        nazwisko: { type: String, required: true },
        email: { type: String, required: true },
        haslo: { type: String, required: true },
        nr_domu: { type: String, required: true },
        nr_lokalu: String,
        ulica: { type: String, required: true },
        miasto: { type: String, required: true },
        kraj: { type: String, required: true },
        kod_pocztowy: { type: String, required: true },
        telefon: { type: String, required: true },
        nip: String,
        faktura: { type: Boolean, default: false },
        osoba_prywatna: { type: Boolean, default: true },
        role: { type: [Types.ObjectId], ref: "Roles", default: [] },
        stripe_id: { type: String },
        verifiedEmail: { type: Boolean, default: false, required: true },
    },
    { autoIndex: false, timestamps: true, },
);

const fileOrderEntrySchema = new Schema<FileOrderEntry>({
    typ: { type: String, required: true },
    nazwa: { type: String, required: true },
    url: { type: String, required: true },
}, { _id: false, optimisticConcurrency: true, timestamps: false, autoIndex: false });

/** Dane do faktury w zamówieniu – wszystkie pola opcjonalne (partial), żeby można było podać inne niż z konta */
const orderDaneSchema = new Schema(
    {
        imie: String,
        nazwisko: String,
        email: String,
        nr_domu: String,
        nr_lokalu: String,
        ulica: String,
        miasto: String,
        kraj: String,
        kod_pocztowy: String,
        telefon: String,
        nip: String,
        faktura: { type: Boolean, default: false },
        osoba_prywatna: { type: Boolean, default: true },
    },
    { _id: false, strict: true },
);

export const schemaOrderList = new Schema<OrderList>(
    {
        user: { type: Types.ObjectId, ref: "Users" },
        email: { type: String, required: true },
        dane: { type: orderDaneSchema },
        numer_zamowienia: {
            type: String,
            required: true,
            unique: true,
        },
        nr_faktury: { type: String },
        nr_faktury_kor: { type: [String] },
        pliki: { type: [fileOrderEntrySchema], default: [] },
        status: { type: String, default: "w_koszyku" },
        sposob_dostawy: { type: Types.ObjectId, ref: "Deliveries" },
        apaczka: {
            service_id: { type: Schema.Types.Mixed },
            service_name: String,
            supplier: String,
            mode: { type: String, enum: ["door", "point"] },
            foreign_address_id: String,
            point_name: String,
            point_address: String,
            price_gross: Number,
            dry: Boolean,
            order_id: String,
            waybill_number: String,
            tracking_url: String,
        },
        produkty: { type: [detailedProductOrderEntrySchema], default: [] },
        kursy: { type: [detailedCourseOrderEntrySchema], default: [] },
        code: { type: Number },
        suma: { type: Number },
        data_zamowienia: { type: Date },
        data_wystawienia_faktury: { type: Date },
        data_wystawienia_faktury_kor: { type: [Date] },
        data_wyslania: { type: Date },
        data_zrealizowania: { type: Date },
        data_anulowania: { type: Date },
    },
    { timestamps: true, autoIndex: false },
);

export const schemaVerifyEmail = new Schema<VerifyEmail>({
    email: { type: String, required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
}, { timestamps: true, autoIndex: false });

export const Role: Model<Roles> =
    (models.Roles as Model<Roles>) ?? model<Roles>("Roles", roleSchemat);
export const User: Model<Users> =
    (models.Users as Model<Users>) ?? model<Users>("Users", userSchemat);
export const Orders: Model<OrderList> =
    (models.Orders as Model<OrderList>) ??
    model<OrderList>("Orders", schemaOrderList);
