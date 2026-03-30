"use client";
import { OrderList } from "@/lib/types/orderTypes";
import TableOrderComponent from "./TableOrderComponent";
import { useState } from "react";
import { formatLocaleDateTime } from "@/lib/dateFormat";


export default function OrderListPage({ order, redirected }: { order: OrderList, redirected: boolean }) {
    const [progress, setProgress] = useState(true);
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.target as HTMLFormElement);
        const email = formData.get("email") as string;
        if (email) {
            setProgress(false);
        }
    }
    if (redirected && progress) {
        return (
            <div className="flex flex-col items-center justify-center max-w-[1200px] mx-auto pt-[180px] pb-20 px-6 min-h-[calc(100vh-200px)] w-full relative">
                <div className="max-w-[1200px] mx-auto relative z-10  p-12 rounded-3xl border border-white/20 bg-white/60 backdrop-blur-[10px]">
                    <h2 className="text-2xl font-bold">Aby przejść dalej, podaj adres email z którego zostało złożone zamówienie</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input type="email" placeholder="Email" className="w-full p-2 rounded-md border border-gray-300" />
                        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">Przejść dalej</button>
                    </form>
                </div>
            </div>
        )
    }
    return (
        <div className="max-w-[1200px] mx-auto pt-[180px] pb-20 px-6 min-h-[calc(100vh-200px)] w-full relative">
            <div className="max-w-[1200px] mx-auto relative z-10  p-12 rounded-3xl border border-white/20 bg-white/60 backdrop-blur-[10px]">
                <h1 className="text-[32px] font-black bg-gradient-to-br from-black via-[#3d3329] to-black bg-clip-text text-transparent mb-10 pb-5 relative inline-block w-full ">Zamówienie: {order?.numer_zamowienia}</h1>
                <p className="text-[17px] leading-[1.9] text-gray-700 [&_p]:mb-7 [&_p:last-child]:mb-0 [&_h2]:text-[32px] [&_h2]:font-bold [&_h2]:bg-gradient-to-br [&_h2]:from-black [&_h2]:to-[#3d3329] [&_h2]:bg-clip-text [&_h2]:text-transparent [&_h2]:mt-12 [&_h2]:mb-5 [&_h2]:pb-3 [&_strong]:font-bold [&_strong]:text-black [&_a]:text-[#D2B79B] [&_a]:no-underline [&_a:hover]:text-[#b89a7f]">Status: {order?.status}</p>
                <p className="text-[17px] leading-[1.9] text-gray-700 [&_p]:mb-7 [&_p:last-child]:mb-0 [&_h2]:text-[32px] [&_h2]:font-bold [&_h2]:bg-gradient-to-br [&_h2]:from-black [&_h2]:to-[#3d3329] [&_h2]:bg-clip-text [&_h2]:text-transparent [&_h2]:mt-12 [&_h2]:mb-5 [&_h2]:pb-3 [&_strong]:font-bold [&_strong]:text-black [&_a]:text-[#D2B79B] [&_a]:no-underline [&_a:hover]:text-[#b89a7f]">Data zamówienia: {formatLocaleDateTime(order?.data_zamowienia ?? null)}</p>
                <p className="text-[17px] leading-[1.9] text-gray-700 [&_p]:mb-7 [&_p:last-child]:mb-0 [&_h2]:text-[32px] [&_h2]:font-bold [&_h2]:bg-gradient-to-br [&_h2]:from-black [&_h2]:to-[#3d3329] [&_h2]:bg-clip-text [&_h2]:text-transparent [&_h2]:mt-12 [&_h2]:mb-5 [&_h2]:pb-3 [&_strong]:font-bold [&_strong]:text-black [&_a]:text-[#D2B79B] [&_a]:no-underline [&_a:hover]:text-[#b89a7f]">Data wysłania: {formatLocaleDateTime(order?.data_wyslania ?? null)}</p>
                <div className="grid grid-cols-1 gap-4">
                    {order.kursy.length > 0 && order.produkty.length > 0 ? (
                        <>
                            <div className="col-span-1">
                                <h2 className="text-xl text-gray-900 font-bold">Produkty</h2>
                                <div className="flex flex-col gap-4">
                                    <TableOrderComponent order={order} type="products" />
                                </div>
                            </div>
                            <div className="col-span-1">
                                <h2 className="text-xl text-gray-900 font-bold">Kursy</h2>
                                <div className="flex flex-col gap-4">
                                    <TableOrderComponent order={order} type="courses" />
                                </div>
                            </div>
                        </>
                    ) : order.kursy.length > 0 ? (
                        <div className="col-span-1">
                            <h2 className="text-xl text-gray-900 font-bold">Kursy</h2>
                            <div className="flex flex-col gap-4">
                                <TableOrderComponent order={order} type="courses" />
                            </div>
                        </div>
                    ) : order.produkty.length > 0 ? (
                        <div className="col-span-1">
                            <TableOrderComponent order={order} type="products" />
                        </div>
                    ) : null}
                </div>
            </div>
        </div >
    )
}