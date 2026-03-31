"use client";
import { OrderList } from "@/lib/types/orderTypes";
import TableOrderComponent from "./TableOrderComponent";
import { useEffect, useState } from "react";
import { formatLocaleDateTime } from "@/lib/dateFormat";
import { useCart } from "@/contexts/CartContext";
import { useUser } from "@/contexts/UserContext";
import { Users } from "@/lib/types/userTypes";
import Link from "next/link";


export default function OrderListPage({ order, redirected }: { order: OrderList, redirected: boolean }) {
    const { userData } = useUser();
    const { clearCart } = useCart();
    if (redirected) {
        clearCart();
    }

    const status = {
        "w_koszyku": "W koszyku",
        "w_realizacji": "W realizacji",
        "wyslane": "Wyslane",
        "anulowane": "Anulowane",
        "zrealizowane": "Zrealizowane",
    }

    const [progress, setProgress] = useState(true);
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const styles = "text-[17px] leading-[1.9] text-gray-700 [&_p]:mb-7 [&_p:last-child]:mb-0 [&_h2]:text-[32px] [&_h2]:font-bold [&_h2]:bg-gradient-to-br [&_h2]:from-black [&_h2]:to-[#3d3329] [&_h2]:bg-clip-text [&_h2]:text-transparent [&_h2]:mt-12 [&_h2]:mb-5 [&_h2]:pb-3 [&_strong]:font-bold [&_strong]:text-black [&_a]:text-[#D2B79B] [&_a]:no-underline [&_a:hover]:text-[#b89a7f]"

    useEffect(() => {
        function s() {
            if (userData) {
                if (userData.email == order.email) {
                    setProgress(false);
                    setLoading(false);
                }
            }
        }
        s();
    }, [userData, order]);


    const handleSubmit = () => {
        console.log(email);
        if (email.length === 0) {
            return;
        }
        if (!email.includes("@")) {
            return;
        }
        if (!email.includes(".")) {
            return;
        }

        if (email !== order.email) {
            setError("Email nie jest taki sam jak ten z zamówienia");
            return;
        }
        setProgress(false);
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center max-w-[1200px] mx-auto pt-[180px] pb-20 px-6 min-h-[calc(100vh-200px)] w-full relative">
                <div className="max-w-[1200px] mx-auto relative z-10  p-12 rounded-3xl border border-white/20 bg-white/60 backdrop-blur-[10px]">
                    <h2 className="text-2xl font-bold">Ładowanie...</h2>
                </div>
            </div>
        )
    }

    if (!redirected && progress) {
        return (
            <div className="flex flex-col items-center justify-center max-w-[1200px] mx-auto pt-[180px] pb-20 px-6 min-h-[calc(100vh-200px)] w-full relative">
                <div className="max-w-[1200px] mx-auto relative z-10  p-12 rounded-3xl border border-white/20 bg-white/60 backdrop-blur-[10px]">
                    <h2 className="text-2xl font-bold">Aby przejść dalej, podaj adres email z którego zostało złożone zamówienie</h2>
                    <div className="flex flex-col gap-4">
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 rounded-md border border-gray-300" />
                        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md" onClick={handleSubmit}>Przejść dalej</button>
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                </div>
            </div>
        )
    }
    if (!order.dane || !order.pliki) {
        return (
            <div className="flex flex-col items-center justify-center max-w-[1200px] mx-auto pt-[180px] pb-20 px-6 min-h-[calc(100vh-200px)] w-full relative">
                <div className="max-w-[1200px] mx-auto relative z-10  p-12 rounded-3xl border border-white/20 bg-white/60 backdrop-blur-[10px]">
                    <h2 className="text-2xl font-bold">Zamówienie nie istnieje</h2>
                </div>
            </div>
        )
    }

    const customer = order.dane as Partial<Users>;
    return (
        <div className="max-w-[1200px] mx-auto pt-[180px] pb-20 px-6 min-h-[calc(100vh-200px)] w-full relative">
            <div className="max-w-[1200px] mx-auto relative z-10  p-12 rounded-3xl border border-white/20 bg-white/60 backdrop-blur-[10px]">
                <h1 className="text-[32px] font-black bg-gradient-to-br from-black via-[#3d3329] to-black bg-clip-text text-transparent mb-10 pb-5 relative inline-block w-full ">Zamówienie: {order?.numer_zamowienia}</h1>
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="flex flex-col gap-4 border-2 border-gray-200 pb-4 rounded-lg p-4">
                        <h2 className="text-2xl font-bold">Informacje o zamówieniu</h2>
                        <div>
                            <p className={styles}>Status: {status[order?.status as keyof typeof status]}</p>
                            <p className={styles}>Data zamówienia: {formatLocaleDateTime(order?.data_zamowienia ?? null)}</p>
                            <p className={styles}>Data wysłania: {formatLocaleDateTime(order?.data_wyslania ?? null)}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 border-2 border-gray-200 pb-4 rounded-lg p-4">
                        <h2 className="text-2xl font-bold">Dane klienta</h2>
                        <div>
                            <p className={styles}>Imię: {customer.imie}</p>
                            <p className={styles}>Nazwisko: {customer.nazwisko}</p>
                            <p className={styles}>Email: {customer.email}</p>
                            <p className={styles}>Telefon: {customer.telefon}</p>
                            <p className={styles}>Adres: {customer.ulica}, {customer.kod_pocztowy} {customer.miasto}, {customer.kraj}</p>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mt-10">
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
                <div className="col-span-1 flex flex-row items-center gap-6 justify-end">
                    <h2 className="text-xl text-gray-900 font-bold">Suma zamówienia</h2>
                    <p className={styles}>{order.suma?.toFixed?.(2) ?? order.suma} zł</p>
                </div>
                <div>
                    <h2 className="text-xl text-gray-900 font-bold">Pliki dołączone do zamówienia</h2>
                    <div className="flex flex-col gap-4">
                        {order.pliki.map((plik) => (
                            <div key={plik.nazwa}>
                                <Link href={plik.url} target="_blank" className="text-blue-500 hover:text-blue-600">{plik.nazwa}</Link>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mt-10 border-2 border-gray-200 rounded-lg p-4">
                    <div className="col-span-1 flex flex-col gap-4">
                        <h2 className="text-xl text-gray-900 font-bold">Masz wątpliwości co do zamówienia? Skontaktuj się z nami</h2>
                        <div className="flex flex-col gap-4 border-t border-gray-200 pt-4">
                            <div className="flex flex-row items-center gap-2 justify-between">
                                <button className="bg-blue-500 text-white p-2 rounded-md">Anuluj zamówienie</button>
                                <div className="w-2/3 ">
                                    <p className={styles}>Jeżeli się rozmyśliłeś z zakupu, skorzystaj z guzika obok. Więcej informacji w regulaminie zwrotów. </p>
                                </div>
                            </div>
                            <div className="flex flex-row items-center gap-2 justify-between border-t border-gray-200 pt-4">
                                <button className="bg-blue-500 text-white p-2 rounded-md w-fit h-fit">Zgłoś reklamacje</button>
                                <div className="w-2/3 ">
                                    <p className={styles}>Jeżeli produkt który zamówiłeś/aś jest niezgodny z oczekiwaniami, skorzystaj z guzika obok. Więcej informacji w regulaminie reklamacji.</p>
                                </div>
                            </div>
                            <div className="flex flex-row items-center gap-2 justify-between border-t border-gray-200 pt-4">
                                <button className="bg-blue-500 text-white p-2 rounded-md">Zwróć usługę</button>
                                <div className="w-2/3 ">
                                    <p className={styles}>Jeżeli usługa którą zamówiłeś/aś jest niezgodna z oczekiwaniami, skorzystaj z guzika obok. Więcej informacji w regulaminie zwrotów.</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl text-gray-900 font-bold">Lub zadzwoń do nas</h2>
                            <p className={styles}>Jeżeli masz dodatkowe pytania, lub potrzebujesz dodatkowych informacji, zadzwoń do nas. </p>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    )
}