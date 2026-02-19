import { Model, model, models, Schema, Types } from "mongoose";
import { Users, Roles, OrderList } from "../types/userTypes";


export const schemaOrderList = new Schema<OrderList>(
    {
        user: { type: Types.ObjectId, ref: "Users" },
        email: { type: String, required: true },
        numer_zamowienia: {
            type: String,
            required: true,
            unique: true,
        },
        status: { type: String, default: "w_koszyku" },
        sposob_dostawy: { type: Types.ObjectId, ref: "delivery" },
        produkty: { type: [Types.ObjectId], ref: "products", default: [] },
        suma: { type: Number },
        data_zamowienia: { type: Date },
        data_wyslania: { type: Date },
        data_zrealizowania: { type: Date },
        data_anulowania: { type: Date },
    },
    { timestamps: true, autoIndex: false },
);

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

export const Role: Model<Roles> =
    (models.Roles as Model<Roles>) ?? model<Roles>("Roles", roleSchemat);
export const User: Model<Users> =
    (models.Users as Model<Users>) ?? model<Users>("Users", userSchemat);
export const Orders: Model<OrderList> =
    (models.Orders as Model<OrderList>) ??
    model<OrderList>("Orders", schemaOrderList);
