"use client";
import { useEffect, useState } from "react";
import { DeliveryMethods } from "@/lib/types/deliveryTypes";
import AdminDeliveryCard from "@/components/admin/AdminDeliveryCard";


export default function DeliveryPage() {

    const [delivery, setDelivery] = useState<DeliveryMethods[]>([]);
    useEffect(() => {
        async function fetchDelivery() {
            const response = await fetch("/admin/api/v1/delivery", {
                credentials: "include",
            });
            const data = await response.json();
            setDelivery(JSON.parse(data.delivery));
        }
        fetchDelivery();
    }, []);
    return (
        <>
            <div>
                <h1>Sposoby wysyłki</h1>
            </div>
            {delivery && delivery.length > 0 ? (
                delivery.map((val) => (
                    <AdminDeliveryCard key={val.nazwa} delivery={val} onClick={() => { }} />
                ))
            ) : (
                <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                    Brak sposobów wysyłki.
                </div>
            )}
        </>
    )
}