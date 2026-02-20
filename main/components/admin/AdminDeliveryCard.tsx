"use client";

import { DeliveryMethods } from "@/lib/types/deliveryTypes";

interface AdminDeliveryCardProps {
    delivery: DeliveryMethods;
    onClick: () => void;
}

export default function AdminDeliveryCard({
    delivery,
    onClick,
}: AdminDeliveryCardProps) {
    return (
        <div
            onClick={onClick}
            className="border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer bg-card hover:bg-accent/50 group">
            {/* Content */}
            <div className="space-y-2">
                <div className="space-y-2">
                    {/* Title */}
                    <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        Nazwa: {delivery.nazwa || "Brak nazwy"}
                    </h3>

                    {/* Slug */}
                    <p className="text-sm text-muted-foreground">
                        Firma: {delivery.firma || "Brak firmy"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Czas dostawy: {delivery.czas_dostawy || "Brak czasu dostawy"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Darmowa dostawa: {delivery.darmowa_dostawa ? "Tak" : "Nie"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Kwota darmowa: {delivery.kwota_darmowa || "Brak kwoty darmowej"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Dostępne rozmiary wysyłki: {delivery.rozmiary.map((size) => size.wielkosci).join(", ") || "Brak rozmiaru"}
                    </p>
                </div>

            </div>
        </div>
    );
}