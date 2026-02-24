"use client";

import { DeliveryMethods as Delivery } from "@/lib/types/deliveryTypes";

interface DeliveryMethodsProps {
    deliver: Delivery;
    selectedWariant: Delivery;
    price: number;
    onSelect: (d: Delivery) => void;
}
export default function DeliveryMethod({
    deliver,
    selectedWariant,
    price,
    onSelect,
}: DeliveryMethodsProps) {
    return (
        <label
            className={`flex cursor-pointer gap-3 rounded-xl border-2 p-4 transition-all ${
                selectedWariant?.nazwa === deliver.nazwa
                    ? "border-[#D2B79B] bg-[#f0e8dd]/50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
            }`}>
            <input
                type="radio"
                name="deliveryMethod"
                value={deliver.nazwa}
                checked={selectedWariant?.nazwa === deliver.nazwa}
                onChange={() => onSelect(deliver)}
                className="sr-only"
            />
            <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                    <strong className="text-gray-900">{deliver.nazwa}</strong>
                    <span className="font-semibold text-[#D2B79B]">
                        {deliver.darmowa_dostawa &&
                        price > deliver.kwota_darmowa
                            ? "Gratis"
                            : deliver.ceny[0].cena}
                    </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{deliver.czas_dostawy}</p>
            </div>
        </label>
    );
}

