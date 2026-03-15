import { Model, model, models, Schema, Types } from "mongoose";
import { Users, Roles, OrderList, DetailedOrderEntry } from "../types/userTypes";
import { FileOrderEntry } from "../types/orderTypes";

export const detailedCourseOrderEntrySchema = new Schema<DetailedOrderEntry>({
    ilosc: { type: Number, required: true },
    pozycja: { type: Types.ObjectId, ref: "Courses" },
}, { _id: false, optimisticConcurrency: true, timestamps: false, autoIndex: false });

export const detailedProductOrderEntrySchema = new Schema<DetailedOrderEntry>({
    ilosc: { type: Number, required: true },
    pozycja: { type: Types.ObjectId, ref: "Products" },
}, { _id: false, optimisticConcurrency: true, timestamps: false, autoIndex: false });



const roleSchemat = new Schema<Roles>(
    {
        nazwa: { type: String, required: true, unique: true },
        uzytkownik: { type: Number, default: 0 },
        admin: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    },
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
    },
    {
        autoIndex: false,
        timestamps: true,
    },
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
        produkty: { type: [detailedProductOrderEntrySchema], default: [] },
        kursy: { type: [detailedCourseOrderEntrySchema], default: [] },
        code: { type: Number },
        suma: { type: Number },
        data_zamowienia: { type: Date },
        data_wyslania: { type: Date },
        data_zrealizowania: { type: Date },
        data_anulowania: { type: Date },
    },
    { timestamps: true, autoIndex: false },
);

export const Role: Model<Roles> =
    (models.Roles as Model<Roles>) ?? model<Roles>("Roles", roleSchemat);
export const User: Model<Users> =
    (models.Users as Model<Users>) ?? model<Users>("Users", userSchemat);
export const Orders: Model<OrderList> =
    (models.Orders as Model<OrderList>) ??
    model<OrderList>("Orders", schemaOrderList);
