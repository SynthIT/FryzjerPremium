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
            className={`checkout-delivery-option ${
                selectedWariant?.nazwa === deliver.nazwa ? "active" : ""
            }`}>
            <input
                type="radio"
                name="deliveryMethod"
                value={deliver.nazwa}
                checked={selectedWariant?.nazwa === deliver.nazwa}
                onChange={() => onSelect(deliver)}
            />
            <div className="checkout-delivery-info">
                <div className="checkout-delivery-name">
                    <strong>{deliver.nazwa}</strong>
                    <span className="checkout-delivery-price">
                        {deliver.darmowa_dostawa &&
                        price > deliver.kwota_darmowa
                            ? "Gratis"
                            : deliver.ceny[0].cena}
                    </span>
                </div>
                <p className="checkout-delivery-desc">{deliver.czas_dostawy}</p>
            </div>
        </label>
    );
}

