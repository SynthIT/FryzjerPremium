import { model, Model, models, Schema } from "mongoose";
import { AccountVerify as AccountVerifyType } from "../types/accountVerifyTypes";

export const accountVerifySchema = new Schema<AccountVerifyType>(
    {
        userId: { type: String, required: false, index: true },
        email: { type: String, required: true, index: true },
        nazwa: { type: String, required: true },
        rodzaj_firmy: {
            type: String,
            enum: [
                "JDG",
                "SP. K.A.",
                "OSOBOWA",
                "JAWNA",
                "SPOLKA AKCYJNA",
                "SPOLKA Z OGRANICZONA ODPOWIEDZIALNOSC",
            ],
            required: true,
        },
        strona_internetowa: { type: String, required: false },
        adres: { type: String, required: false },
        miasto: { type: String, required: false },
        kod_pocztowy: { type: String, required: false },
        kraj: { type: String, required: false },
        nip: { type: String, required: true },
        krs: { type: String, required: false },
        regon: { type: String, required: false },
        e_mail: { type: String, required: false },
        telefon: { type: String, required: false },
        fax: { type: String, required: false },
        www: { type: String, required: false },
        nrtel: { type: String, required: false },
        nrtel2: { type: String, required: false },
        numer_telefonu: { type: String, required: false },
        status: {
            type: String,
            enum: ["oczekujace", "zaakceptowane", "odrzucone"],
            default: "oczekujace",
        },
        powod_odrzucenia: { type: String, required: false },
        reviewedAt: { type: Date, required: false },
    },
    {
        timestamps: true,
        autoIndex: false,
        optimisticConcurrency: true,
    },
);

export const AccountVerify: Model<AccountVerifyType> =
    (models.AccountVerify as Model<AccountVerifyType>) ??
    model<AccountVerifyType>("AccountVerify", accountVerifySchema);
