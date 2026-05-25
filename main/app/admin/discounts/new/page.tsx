"use client";

import { useState } from "react";
import "@/app/globals2.css";
import { useRouter } from "next/navigation";
import PromoFormFields, {
    PromoFormState,
    buildPromoPayload,
} from "@/components/admin/PromoFormFields";

export default function NewDiscountPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formState, setFormState] = useState<PromoFormState>({
        nazwa: "",
        typPromocji: "standard",
        procent: 0,
        start: new Date(),
        end: new Date(Date.now() + 24 * 60 * 60 * 1000),
        aktywna: true,
        specialNazwa: "",
        warunek: 0,
        obnizaCene: false,
        obnizka: 0,
        zmieniaCene: false,
        nowaCena: 0,
    });

    const sendNewPromo = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/admin/api/v1/promo/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(buildPromoPayload(formState)),
            }).then((r) => r.json());

            if (res.status === 0) {
                router.push("/admin/discounts");
            } else {
                alert(res.error || res.message);
            }
        } catch (err) {
            console.error(err);
            alert("Błąd podczas zapisywania promocji.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    Dodaj promocję
                </h1>
                <p className="text-sm text-muted-foreground sm:text-base">
                    Uzupełnij podstawowe informacje o promocji. Możesz utworzyć
                    promocję procentową lub specjalną (warunkową).
                </p>
            </div>

            <form
                onSubmit={sendNewPromo}
                className="grid gap-4 rounded-lg border p-3 sm:p-4 sm:grid-cols-2">
                <PromoFormFields
                    state={formState}
                    onChange={(patch) => setFormState((s) => ({ ...s, ...patch }))}
                />
                <div className="sm:col-span-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50">
                        {isSubmitting ? "Zapisywanie..." : "Zapisz promocję"}
                    </button>
                </div>
            </form>
        </div>
    );
}
