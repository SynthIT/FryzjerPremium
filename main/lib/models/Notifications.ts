import { models, Model, model, Schema } from "mongoose";
import { notificationsType } from "../types/notificationsTypes";

export const notificationsSchema = new Schema<notificationsType>({
    nazwa: { type: String, required: true },
    typ: { type: String, enum: ["Konto do weryfikacja", "Mały stan towary", "Brak towaru", "Nowe zamówienie"], required: true },
    tresc: { type: String, required: true },
    link: { type: String, required: false },
    czy_przeczytane: { type: Boolean, default: false },
    czy_aktywne: { type: Boolean, default: true },
}, { timestamps: true, autoIndex: false, optimisticConcurrency: true });

export const Notifications: Model<notificationsType> = (models.Notifications as Model<notificationsType>) ?? model<notificationsType>("Notifications", notificationsSchema);