"use client";

import { useState } from "react";
import "@/app/globals2.css";
import { useRouter } from "next/navigation";
import { DeliveryMethods, DeliveryMethodsSizes } from "@/lib/types/deliveryTypes";
import { Loader2, Plus } from "lucide-react";
import AdminDeliverySizeEditable from "@/components/admin/components/AdminDeliverySizeEditable";
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

    const addRozmiar = () => {
        setRozmiary((prev) => [...prev,
        {
            cena: 0,
            wielkosci: "",
            wysokosc: 0,
            szerokosc: 0,
            dlugosc: 0
        }]);
    };
    const deleteRozmiar = (index: number) => {
        setRozmiary((prev) => prev.filter((_, i) => i !== index));
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateRozmiar = (index: number, field: "cena" | "wielkosci" | "wysokosc" | "szerokosc" | "dlugosc", value: any) => {
        setRozmiary((prev) => {
            const updated = [...prev];
            value = !Number.isNaN(parseInt(value)) ? parseFloat(value) : value;
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };
    const sendNewDelivery = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        deliveryData.rozmiary = rozmiary;
        try {
            const res = await fetch("/admin/api/v1/delivery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(deliveryData),
            }).then((r) => r.json());

            if (res.status === 201) {
                alert("Dostawa została dodana pomyślnie!");
                router.push("/admin/delivery");
            } else {
                alert("Błąd podczas dodawania dostawy: " + (res.error || res.message));
            }
        } catch (err) {
            console.error("Błąd podczas dodawania dostawy:", err);
            alert("Błąd podczas dodawania dostawy. Sprawdź konsolę.");
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
                className="grid gap-4 rounded-lg border p-3 sm:p-4 sm:grid-cols-2"
            >
                {/* Nazwa */}
                <div className="flex flex-row justify-between gap-2 w-full sm:col-span-2">
                    <div className="flex flex-col w-full">
                        <label className="text-sm font-medium">Nazwa *</label>
                        <input
                            type="text"
                            value={deliveryData.nazwa}
                            onChange={(e) => setDeliveryData({ ...deliveryData, nazwa: e.target.value, slug: generateSlug(e.target.value) })}
                            required
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                            placeholder="Np. Paczkomaty Inpost"
                        />
                    </div>
                    <div className="flex flex-col w-full">
                        <label className="text-sm font-medium">Firma *</label>
                        <input
                            type="text"
                            value={deliveryData.firma}
                            onChange={(e) => setDeliveryData({ ...deliveryData, firma: e.target.value })}
                            required
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                            placeholder="Np. Inpost"
                        />
                    </div>
                    <div className="flex flex-col w-full">
                        <label className="text-sm font-medium">Strona internetowa *</label>
                        <input
                            type="text"
                            value={deliveryData.strona_internetowa}
                            onChange={(e) => setDeliveryData({ ...deliveryData, strona_internetowa: e.target.value })}
                            required
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                            placeholder="https://inpost.pl"
                        />
                    </div>
                </div>

                {/* Ceny */}
                <div className="grid gap-2 sm:col-span-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                            Rozmiary
                        </label>
                        <button
                            type="button"
                            onClick={addRozmiar}
                            className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-1">
                            <Plus className="h-3 w-3" />
                            Dodaj
                        </button>
                    </div>
                    <div className="space-y-2">
                        {rozmiary.map((rozmiar, index) => (
                            <div key={index} className="flex gap-2">
                                <AdminDeliverySizeEditable
                                    key={index}
                                    size={rozmiar}
                                    onClick={(e) => updateRozmiar(index, e.target.id as "cena" | "wielkosci" | "wysokosc" | "szerokosc" | "dlugosc", e.target.value)}
                                    deleterRozmiar={() => deleteRozmiar(index)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Czas dostawy */}
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">Czas dostawy *</label>
                    <input
                        type="text"
                        value={deliveryData.czas_dostawy}
                        onChange={(e) => setDeliveryData({ ...deliveryData, czas_dostawy: e.target.value })}
                        required
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        placeholder="1"
                    />
                </div>

                <div className="grid gap-2 sm:col-span-2">
                    <div className="flex items-center gap-2 p-3 border rounded-md">
                        <input
                            type="checkbox"
                            id="obniza_cene"
                            checked={deliveryData.darmowa_dostawa}
                            onChange={(e) =>
                                setDeliveryData({ ...deliveryData, darmowa_dostawa: e.target.checked })
                            }
                            className="w-4 h-4"
                        />
                        <label
                            htmlFor="obniza_cene"
                            className="text-sm font-medium"
                        >
                            Darmowa dostawa
                        </label>
                    </div>
                    {deliveryData.darmowa_dostawa && (
                        <div className="pl-4">
                            <label className="text-xs font-medium text-muted-foreground">
                                Darmowa dostawa od kwoty
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min={0}
                                value={deliveryData.kwota_darmowa}
                                onChange={(e) =>
                                    setDeliveryData({ ...deliveryData, kwota_darmowa: parseFloat(e.target.value) || 0 })}
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm mt-1"
                            />
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
                    disabled={isSubmitting}
                >
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
        </div >
    );
}