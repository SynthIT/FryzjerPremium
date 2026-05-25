"use client";

import { Plus } from "lucide-react";
import {
    DeliveryMethods,
    DeliveryMethodsSizes,
} from "@/lib/types/deliveryTypes";
import AdminDeliverySizeEditable from "@/components/admin/AdminDeliverySizeEditable";
import { adminInputClass } from "./adminFormStyles";

interface DeliveryMethodFormFieldsProps {
    deliveryData: DeliveryMethods;
    onDeliveryChange: (data: DeliveryMethods) => void;
    rozmiary: DeliveryMethodsSizes[];
    onRozmiaryChange: (rozmiary: DeliveryMethodsSizes[]) => void;
    onSlugFromName?: (slug: string) => void;
}

export default function DeliveryMethodFormFields({
    deliveryData,
    onDeliveryChange,
    rozmiary,
    onRozmiaryChange,
    onSlugFromName,
}: DeliveryMethodFormFieldsProps) {
    const set = (patch: Partial<DeliveryMethods>) =>
        onDeliveryChange({ ...deliveryData, ...patch });

    const addRozmiar = () =>
        onRozmiaryChange([
            ...rozmiary,
            { cena: 0, wielkosci: "", wysokosc: 0, szerokosc: 0, dlugosc: 0 },
        ]);

    const deleteRozmiar = (index: number) =>
        onRozmiaryChange(rozmiary.filter((_, i) => i !== index));

    const updateRozmiar = (
        index: number,
        field: "cena" | "wielkosci" | "wysokosc" | "szerokosc" | "dlugosc",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: any,
    ) => {
        const updated = [...rozmiary];
        const parsed = !Number.isNaN(parseInt(String(value)))
            ? parseFloat(String(value))
            : value;
        updated[index] = { ...updated[index], [field]: parsed };
        onRozmiaryChange(updated);
    };

    return (
        <>
            <div className="flex flex-row justify-between gap-2 w-full sm:col-span-2">
                <div className="flex flex-col w-full">
                    <label className="text-sm font-medium">Nazwa *</label>
                    <input
                        type="text"
                        value={deliveryData.nazwa}
                        onChange={(e) => {
                            set({ nazwa: e.target.value });
                            onSlugFromName?.(e.target.value);
                        }}
                        required
                        className={adminInputClass}
                        placeholder="Np. Paczkomaty Inpost"
                    />
                </div>
                <div className="flex flex-col w-full">
                    <label className="text-sm font-medium">Firma *</label>
                    <input
                        type="text"
                        value={deliveryData.firma}
                        onChange={(e) => set({ firma: e.target.value })}
                        required
                        className={adminInputClass}
                        placeholder="Np. Inpost"
                    />
                </div>
                <div className="flex flex-col w-full">
                    <label className="text-sm font-medium">Strona internetowa *</label>
                    <input
                        type="text"
                        value={deliveryData.strona_internetowa}
                        onChange={(e) => set({ strona_internetowa: e.target.value })}
                        required
                        className={adminInputClass}
                        placeholder="https://inpost.pl"
                    />
                </div>
            </div>
            <div className="grid gap-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Rozmiary</label>
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
                        <AdminDeliverySizeEditable
                            key={index}
                            size={rozmiar}
                            onClick={(e) =>
                                updateRozmiar(
                                    index,
                                    e.target.id as
                                        | "cena"
                                        | "wielkosci"
                                        | "wysokosc"
                                        | "szerokosc"
                                        | "dlugosc",
                                    e.target.value,
                                )
                            }
                            deleterRozmiar={() => deleteRozmiar(index)}
                        />
                    ))}
                </div>
            </div>
            <div className="grid gap-2 sm:col-span-2">
                <label className="text-sm font-medium">Czas dostawy *</label>
                <input
                    type="text"
                    value={deliveryData.czas_dostawy}
                    onChange={(e) => set({ czas_dostawy: e.target.value })}
                    required
                    className={adminInputClass}
                    placeholder="1-3 dni robocze"
                />
            </div>
            <div className="grid gap-2 sm:col-span-2">
                <div className="flex items-center gap-2 p-3 border rounded-md">
                    <input
                        type="checkbox"
                        id="darmowa_dostawa"
                        checked={deliveryData.darmowa_dostawa}
                        onChange={(e) => set({ darmowa_dostawa: e.target.checked })}
                        className="w-4 h-4"
                    />
                    <label htmlFor="darmowa_dostawa" className="text-sm font-medium">
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
                                set({
                                    kwota_darmowa: parseFloat(e.target.value) || 0,
                                })
                            }
                            className={`${adminInputClass} mt-1`}
                        />
                    </div>
                )}
            </div>
        </>
    );
}
