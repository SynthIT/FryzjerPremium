import { db } from "@/lib/db/init";
import { AccountVerify } from "@/lib/models/AccountVerify";
import { Notifications } from "@/lib/models/Notifications";
import { User } from "@/lib/models/Users";
import {
    AccountVerify as AccountVerifyType,
    AccountVerifySubmitSchema,
} from "@/lib/types/accountVerifyTypes";

export async function collectAccountVerifies() {
    await db();
    const docs = await AccountVerify.find().sort({ createdAt: -1 }).lean();
    return docs;
}

export async function getAccountVerifyByEmail(email: string) {
    await db();
    return AccountVerify.findOne({ email }).sort({ createdAt: -1 }).lean();
}

export async function submitAccountVerify(
    email: string,
    userId: string | undefined,
    payload: unknown,
) {
    const parsed = AccountVerifySubmitSchema.safeParse(payload);
    if (!parsed.success) {
        return { ok: false as const, error: parsed.error.flatten() };
    }

    await db();

    const existing = await AccountVerify.findOne({
        email,
        status: "oczekujace",
    });
    if (existing) {
        return {
            ok: false as const,
            error: "Masz już wniosek oczekujący na rozpatrzenie.",
        };
    }

    const approved = await AccountVerify.findOne({
        email,
        status: "zaakceptowane",
    });
    if (approved) {
        return {
            ok: false as const,
            error: "Twoje konto firmowe jest już zweryfikowane.",
        };
    }

    const doc = await AccountVerify.create({
        ...parsed.data,
        email,
        userId,
        status: "oczekujace",
        e_mail: email,
    });

    try {
        await Notifications.create({
            nazwa: `Weryfikacja: ${parsed.data.nazwa}`,
            typ: "Konto do weryfikacji",
            tresc: `Nowa prośba o weryfikację konta firmowego od ${email} (NIP: ${parsed.data.nip}).`,
            link: "/admin/customers/account-verify",
            czy_przeczytane: false,
            czy_aktywne: true,
        });
    } catch {
        // powiadomienie nie blokuje wniosku
    }

    return { ok: true as const, doc };
}

export async function reviewAccountVerify(
    id: string,
    action: "zaakceptowane" | "odrzucone",
    powod_odrzucenia?: string,
) {
    await db();
    const doc = await AccountVerify.findById(id);
    if (!doc) return { ok: false as const, error: "Nie znaleziono wniosku." };
    if (doc.status !== "oczekujace") {
        return { ok: false as const, error: "Wniosek został już rozpatrzony." };
    }

    doc.status = action;
    doc.reviewedAt = new Date();
    if (action === "odrzucone") {
        doc.powod_odrzucenia = powod_odrzucenia?.trim() || "Brak podanego powodu.";
    } else {
        doc.powod_odrzucenia = undefined;
        await User.findOneAndUpdate(
            { email: doc.email },
            {
                $set: {
                    osoba_prywatna: false,
                    nip: doc.nip,
                    faktura: true,
                },
            },
        );
    }
    await doc.save();
    return { ok: true as const, doc: doc.toObject() as AccountVerifyType };
}
