"use client";

import { useState } from "react";
import "@/app/globals2.css";
import { useRouter } from "next/navigation";
import { DeliveryMethods, DeliveryMethodsSizes } from "@/lib/types/deliveryTypes";
import { Loader2, Plus } from "lucide-react";
import DeliveryMethodFormFields from "@/components/admin/DeliveryMethodFormFields";
import { generateSlug } from "@/lib/utils_admin";

export default function NewDeliveryPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deliveryData, setDeliveryData] = useState<DeliveryMethods>({
        nazwa: "",
        slug: "",
        rozmiary: [],
        czas_dostawy: "",
        darmowa_dostawa: false,
        kwota_darmowa: 0,
        firma: "",
        strona_internetowa: "",
    });
    const [rozmiary, setRozmiary] = useState<DeliveryMethodsSizes[]>([]);

    const sendNewDelivery = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const payload = { ...deliveryData, rozmiary };
        try {
            const res = await fetch("/admin/api/v1/delivery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            }).then((r) => r.json());

            if (res.status === 201) {
                alert("Dostawa została dodana pomyślnie!");
                router.push("/admin/delivery");
            } else {
                alert("Błąd: " + (res.error || res.message));
            }
        } catch (err) {
            console.error(err);
            alert("Błąd podczas dodawania dostawy.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    Dodaj sposób wysyłki
                </h1>
                <p className="text-sm text-muted-foreground sm:text-base">
                    Uzupełnij podstawowe informacje o sposobie wysyłki.
                </p>
            </div>

            <form
                onSubmit={sendNewDelivery}
                className="grid gap-4 rounded-lg border p-3 sm:p-4 sm:grid-cols-2">
                <DeliveryMethodFormFields
                    deliveryData={deliveryData}
                    onDeliveryChange={setDeliveryData}
                    rozmiary={rozmiary}
                    onRozmiaryChange={setRozmiary}
                    onSlugFromName={(name) =>
                        setDeliveryData((d) => ({ ...d, slug: generateSlug(name) }))
                    }
                />
                <button
                    type="submit"
                    className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50 sm:col-span-2"
                    disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Zapisywanie...
                        </>
                    ) : (
                        <>
                            <Plus className="h-4 w-4" />
                            Utwórz sposób wysyłki
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
