import { model, Schema, Types } from "mongoose";
import db from "../db";

export interface CartsItem {
    produkt_id: Types.ObjectId[];
    ilosc: number;
    suma?: number | null;
}

export const cartItemSchema = new Schema<CartsItem>(
    {
        produkt_id: [{ type: Types.ObjectId, required: true, ref: "Products" }],
        ilosc: { type: Number, required: true, default: 1, max: 10 },
        suma: Number,
    },
    { timestamps: true }
);
