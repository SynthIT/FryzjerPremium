import { Schema, Types } from "mongoose";
import { z } from "zod";
import { zodProducts } from "./Products";
import { zodDeliveryMethods } from "./Delivery";
import { randomBytes } from "crypto";
import { OrderList } from "../types/userTypes";

function createOrderNumber() {
    const h = randomBytes(2 ** 3).toString("hex");
    const a = new Date();
    const d =
        `${h}-${a.getDate() < 10 ? `0${a.getDate()}` : a.getDate()}` +
        `${a.getMonth() < 10 ? `0${a.getMonth()}` : a.getMonth()}` +
        `${a.getFullYear()}`;
    return d;
}

export const schemaOrderList = new Schema<OrderList>(
    {
        numer_zamowienia: {
            type: String,
            default: createOrderNumber(),
            unique: true,
        },
        sposob_dostawy: { type: Types.ObjectId, ref: "delivery" },
        produkty: { type: [Types.ObjectId], ref: "products", default: [] },
        suma: { type: Number },
        data_wykonania: { type: Date, default: new Date() },
    },
    { timestamps: true, autoIndex: false }
);

