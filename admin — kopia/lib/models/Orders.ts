import { Schema, Types } from "mongoose";
import { Products } from "./Products";
import { DeliveryMethods } from "./Delivery";
import { randomBytes } from "crypto";

function createOrderNumber() {
    const h = randomBytes(2 ** 3).toString("hex");
    const a = new Date();
    const d =
        `${a.getDate() < 10 ? `0${a.getDate()}` : a.getDate()}` +
        `${a.getMonth() < 10 ? `0${a.getMonth()}` : a.getMonth()}` +
        `${a.getFullYear()}-${h}`;
    return d;
}

export interface OrderList {
    numer_zamowienia: string;
    sposob_dostawy: DeliveryMethods;
    produkty: Products[];
    suma: number;
    data_wykonania: Date;
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
    { timestamps: true }
);
