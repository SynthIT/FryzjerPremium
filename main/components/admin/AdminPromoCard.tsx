"use client";

import { Promos } from "@/lib/types/shared";
import { useEffect, useMemo, useState } from "react";

interface AdminPromoCardProps {
    promo: Promos;
    onClick: () => void;
}

export default function AdminPromoCard({
    promo,
    onClick,
}: AdminPromoCardProps) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = setInterval(() => {
            setNow(Date.now());
        }, 60000); // np. co minutę

        return () => clearInterval(id);
    }, []);

    const lastingTime = useMemo<string>(() => {
        const today = now;
        const end = new Date(promo.wygasa).getTime();
        const lasting = end - today;
        const days = Math.floor(lasting / 1000 / 60 / 60 / 24);
        const hour = Math.floor((lasting / 1000 / 60 / 60) % 24);
        const minutes = Math.floor((lasting / 1000 / 60) % 60);
        if (days < 0 && hour < 0 && minutes < 0) return `Wygasło`;
        if (days < 0 && hour < 0) return `${minutes}m`;
        if (days < 0) return `${hour}g ${minutes}m`;
        return `${days}d ${hour}g ${minutes}m`;
    }, [now, promo]);

    return (
        <div onClick={onClick} className="border rounded-lg p-4">
            <div className="space-y-2">
                <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {promo.nazwa || "Brak nazwy"}
                </h3>
                <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                        <div className="text-sm text-green-700">
                            {promo.procent}%
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                            Wygasa za:
                        </div>
                        <div className="font-semibold text-red-600">
                            {lastingTime}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

