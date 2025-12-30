import { Model, model, models, Schema, Types } from "mongoose";
import { Users, Roles, OrderList } from "../types/userTypes";
import { schemaOrderList } from "./Orders";

const roleSchemat = new Schema<Roles>(
    {
        nazwa: { type: String, required: true, unique: true },
        uzytkownik: { type: Number, default: 0 },
        admin: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
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
        zamowienia: { type: [Types.ObjectId], ref: "Orders", default: [] },
        faktura: { type: Boolean, default: false },
        osoba_prywatna: { type: Boolean, default: true },
        role: { type: [Types.ObjectId], ref: "Roles", default: [] },
    },
    {
        timestamps: true,
    }
);

export const Role: Model<Roles> =
    (models.Roles as Model<Roles>) ?? model<Roles>("Roles", roleSchemat);
export const User: Model<Users> =
    (models.Users as Model<Users>) ?? model<Users>("Users", userSchemat);
export const Orders: Model<OrderList> =
    (models.Orders as Model<OrderList>) ??
    model<OrderList>("Orders", schemaOrderList);
