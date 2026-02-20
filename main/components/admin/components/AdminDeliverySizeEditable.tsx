"use client";

import { DeliveryMethodsSizes } from "@/lib/types/deliveryTypes";
import { Trash2 } from "lucide-react";

interface AdminDeliverySizeEditableProps {
    size: DeliveryMethodsSizes;
    onClick: (e: React.ChangeEvent<HTMLInputElement>) => void;
    deleterRozmiar: () => void;
}

export default function AdminDeliverySizeEditable({
    size,
    onClick,
    deleterRozmiar,
}: AdminDeliverySizeEditableProps) {
    return (
        <div className="flex flex-row justify-between gap-2 w-full sm:col-span-2">

            <div className="flex flex-col w-full">
                <label className="text-sm font-medium">Wielkość</label>
                <input className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                    type="string"
                    placeholder="Wielkość"
                    value={size.wielkosci}
                    id="wielkosci"
                    onChange={onClick}
                />
            </div>
            <div className="flex flex-col w-full">
                <label className="text-sm font-medium">Cena</label>
                <input className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                    type="number"
                    placeholder="Cena"
                    value={size.cena}
                    id="cena"
                    onChange={onClick}
                />
            </div>
            <div className="flex flex-col w-full">
                <label className="text-sm font-medium">Wysokość</label>
                <input className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                    type="number"
                    placeholder="Wysokość"
                    value={size.wysokosc}
                    id="wysokosc"
                    onChange={onClick}
                />
            </div>

            <div className="flex flex-col w-full">
                <label className="text-sm font-medium">Szerokość</label>
                <input className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                    type="number"
                    placeholder="Szerokość"
                    value={size.szerokosc}
                    id="szerokosc"
                    onChange={onClick}
                />
            </div>
            <div className="flex flex-col w-full">
                <label className="text-sm font-medium">Długość</label>
                <input className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                    type="number"
                    placeholder="Długość"
                    value={size.dlugosc}
                    id="dlugosc"
                    onChange={onClick}
                />
            </div>
            <button
                className="px-2 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-1"
                onClick={deleterRozmiar}>
                <Trash2 className="h-3 w-3" />
                Usuń
            </button>
        </div>
    );
}

