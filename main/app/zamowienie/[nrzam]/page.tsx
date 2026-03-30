"use client";
import ZamowienieDetailShopPage from "@/components/zamowienie/ZamowienieDetailShopPage";
import ZamowienieNotFound from "@/components/zamowienie/ZamowienieNotFound";
import { useCart } from "@/contexts/CartContext";
import { OrderList } from "@/lib/types/orderTypes";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderPage() {
    const { nrzam } = useParams();
    const query = useSearchParams();
    const redirected = query.get("redirected");
    const { clearCart } = useCart();
    if (redirected) {
        clearCart();
    }
    const [order, setOrder] = useState<OrderList | null>(null);
    useEffect(() => {
        async function getOrder() {
            const order = await fetch(`/api/v1/users/orders/${nrzam}`, {
                credentials: "include",
            })
                .then((res) => res.json())
                .then((data) => {
                    return data.order;
                });
            setOrder(order);
        }
        getOrder();
    }, [nrzam]);

    if (!order) {
        return <ZamowienieNotFound nrzam={nrzam as string} />;
    }
    return <ZamowienieDetailShopPage order={order as OrderList} redirected={redirected === "true"} />;
}
