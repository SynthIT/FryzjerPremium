import { models, Model, model, Schema } from "mongoose";
import { Verify } from "../types/verifyTypes";

export const verifySchema = new Schema<Verify>(
    {
        email: { type: String, required: true },
        hash: { type: String, required: true },
        code: { type: Number, required: true },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true, autoIndex: false, optimisticConcurrency: true },
);

export const Verifydb: Model<Verify> =
    (models.Verify as Model<Verify>) ??
    model<Verify>("Verify", verifySchema);