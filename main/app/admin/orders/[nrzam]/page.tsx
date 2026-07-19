"use client";
import { formatLocaleDateTime } from "@/lib/dateFormat";
import { Courses } from "@/lib/types/coursesTypes";
import { OrderList } from "@/lib/types/orderTypes";
import { Products } from "@/lib/types/productTypes";
import Stripe from "stripe";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderPage() {
    const params = useParams();
    const router = useRouter();
    const nrzam = params.nrzam;
    const [order, setOrder] = useState<OrderList | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentintent, setPaymentintent] = useState<Stripe.PaymentIntent | null>(null);
    const [editStatus, setEditStatus] = useState(false);
    const [reason, setReason] = useState("");
    const statues = [
        { label: "W koszyku", value: "w_koszyku" },
        { label: "Nowe", value: "nowe" },
        { label: "W realizacji", value: "w_realizacji" },
        { label: "Wyslane", value: "wyslane" },
        { label: "Zrealizowane", value: "zrealizowane" },
        { label: "Anulowane", value: "anulowane" },
    ]

    const [selectedStatus, setSelectedStatus] = useState(order?.status ?? "");

    useEffect(() => {
        async function getOrder() {
            const [order, paymentintent] = await Promise.all([
                fetch(`/admin/api/v1/orders?nrzam=${nrzam as string}`).then((res) => res.json()),
                fetch(`/admin/api/v1/payments?nrzam=${nrzam as string}`).then((res) => res.json()),
            ]);
            setOrder(order.order as OrderList);
            setPaymentintent(paymentintent.paymentIntent as Stripe.PaymentIntent);
            setLoading(false);
            console.log({ order, paymentintent });
            return { order, paymentintent };
        }
        getOrder().then(({ order, paymentintent }) => {
            if (order.status === 1 || paymentintent.status === 1) {
                document.location.href = "/admin/orders?notfound=true&nrzam=" + nrzam;
                setLoading(false);
                return;
            }
            console.log(order, paymentintent);
        }).catch(() => {
            setLoading(false);
        });
    }, [nrzam]);

    if (loading) {
        return <div>Ładowanie...</div>
    }
    const prepareStatus = (status: string) => {
        return statues.find((statue) => statue.value === status)?.label;
    }

    const handleClickEditStatus = () => {
        setEditStatus(true);
    }

    const handleEditStatus = (status: string) => {
        setEditStatus(false);
        setSelectedStatus(status);
        fetch(`/admin/api/v1/orders`, {
            method: "PUT",
            body: JSON.stringify({ order: order, status: status, reason: reason ? reason : "Nie podano powodu anulowania zamówienia" }),
        }).then((res) => res.json()).then((data) => {
            setOrder(data.order as OrderList);

        })
    }
    const checkForStatus = (show?: boolean) => {
        if (show) return false;
        if (!order) return true;
        if (order.status === "anulowane") return true;
        return false;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-rows gap-2 justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Zamówienie {nrzam}</h1>
                    <p className="text-muted-foreground">Przeglądaj i zarządzaj zamówieniem klienta.</p>
                </div>
                <div>
                    <Link href={`/admin/orders/${nrzam}/korektor`} className="underline border-1 p-2 m-2 rounded-md hover:bg-gray-100 transition-colors text-center">Dodaj fakturę korygującą</Link>
                </div>
            </div>

            {checkForStatus() ? (
                <>
                    <div className="fixed top-0 left-0 w-full h-full bg-red-500 opacity-50 z-50">
                        <div className="flex flex-col items-center justify-center h-full">
                            <h2 className="text-2xl font-semibold tracking-tight text-white">Zamówienie anulowane</h2>
                            <p className="text-muted-foreground text-white">Zamówienie zostało anulowane przez administratora.</p>
                            <p className="text-muted-foreground text-white">Powód: {order?.reason}</p>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors" onClick={() => handleEditStatus("nowe")}>Przywróć zamówienie</button>
                            <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors" onClick={() => router.push("/admin/orders")}>Wróć do strony zamówień</button>
                            <button className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors" onClick={() => { checkForStatus(true) }}>Zobacz dane zamówienia</button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Dane klienta w zamówieniu */}
                    <div className="rounded-lg border p-4">
                        <div className="flex justify-between items-center">
                            <h2 className="mb-3 text-base font-medium">Dane klienta w zamówieniu. </h2>
                            <Link href={`https://dashboard.stripe.com/customers/${paymentintent?.customer}`} target="_blank" className="underline border-1 p-2 m-2 rounded-md hover:bg-gray-100 transition-colors text-center">Przeglądaj użytkownika na Stripe</Link>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <p className="text-sm text-foreground">Imię: {order?.dane?.imie}</p>
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <p className="text-sm text-foreground">Nazwisko: {order?.dane?.nazwisko}</p>
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <p className="text-sm text-foreground">Email: {order?.email}</p>
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <p className="text-sm text-foreground">Telefon: {order?.dane?.telefon}</p>
                            </div>
                        </div>
                    </div>
                    {/* Dane zamówienia */}
                    <div className="rounded-lg border p-4">
                        <div className="flex justify-between items-center">
                            <h2 className="mb-3 text-base font-medium">Dane zamówienia</h2>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors" onClick={handleClickEditStatus}>Edytuj status</button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <p className="text-sm text-foreground">
                                    Data zamówienia:{" "}
                                    {formatLocaleDateTime(order?.createdAt ?? null)}
                                </p>
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="grid gap-2">
                                {editStatus ?
                                    (
                                        <>
                                            <p className="text-sm text-foreground">Status zamówienia: {prepareStatus(order?.status ?? "")}</p>
                                            <div className="flex flex-row gap-2 items-center w-full">

                                                <p className="text-sm text-foreground">Nowy status: </p>
                                                <select className="text-sm text-foreground border-2 border-gray-300 rounded-md p-2" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                                                    {statues.map((statue) => (
                                                        <option key={statue.value} value={statue.value}>{statue.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {selectedStatus == "anulowane" &&
                                                (<>
                                                    <p>Powód anulowania zamówienia?: </p>
                                                    <input type="text" className="text-sm text-foreground border-2 border-gray-300 rounded-md p-2" value={reason} onChange={(e) => setReason(e.target.value)} />
                                                </>)}
                                            < button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors" onClick={() => handleEditStatus(selectedStatus)}>Zapisz</button>
                                        </>
                                    )
                                    :
                                    <p className="text-sm text-foreground">Status zamówienia: {prepareStatus(order?.status ?? "")}</p>}
                            </div>
                        </div>
                    </div>
                    {/* Dane płatności */}
                    <div className="rounded-lg border p-4">
                        <h2 className="mb-3 text-base font-medium">Dane płatności</h2>
                        <div className="grid gap-3 sm:grid-cols-2 ">
                            <div className="p-2 m-2">
                                <p className="text-sm text-foreground">Metoda płatności:</p>
                            </div>
                            <div className="p-2 m-2">
                                <Link href={`https://dashboard.stripe.com/payments/${paymentintent?.id}`} target="_blank" className="underline border-1 p-2 m-2 rounded-md hover:bg-gray-100 transition-colors  text-center">Zarządzaj na stronie Stripe</Link>
                            </div>
                        </div>
                    </div>
                    {/* Dostawa Apaczka */}
                    {order?.apaczka && (
                        <div className="rounded-lg border p-4">
                            <h2 className="mb-3 text-base font-medium">Dostawa (Apaczka)</h2>
                            <div className="grid gap-2 text-sm">
                                <p>Usługa: {order.apaczka.service_name}</p>
                                <p>
                                    Tryb:{" "}
                                    {order.apaczka.mode === "point" ? "Punkt odbioru" : "Kurier"}
                                </p>
                                {order.apaczka.point_name && (
                                    <p>Punkt: {order.apaczka.point_name}</p>
                                )}
                                {order.apaczka.waybill_number && (
                                    <p>Numer listu: {order.apaczka.waybill_number}</p>
                                )}
                                {order.apaczka.tracking_url && (
                                    <a
                                        href={order.apaczka.tracking_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="underline break-all"
                                        title={order.apaczka.tracking_url}
                                    >
                                        {order.apaczka.tracking_url.length > 48
                                            ? `${order.apaczka.tracking_url.slice(0, 28)}••••${order.apaczka.tracking_url.slice(-8)}`
                                            : order.apaczka.tracking_url}
                                    </a>
                                )}
                                <a
                                    href={`/admin/api/v1/orders/waybill?nrzam=${encodeURIComponent(String(nrzam))}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-2 inline-block underline border-1 p-2 rounded-md hover:bg-gray-100 transition-colors text-center w-fit"
                                >
                                    Pobierz list przewozowy (PDF)
                                </a>
                                <p className="text-xs text-muted-foreground">
                                    PDF generowany na żądanie z base64 Apaczka — bez zapisu w Blob.
                                </p>
                            </div>
                        </div>
                    )}
                    {/* Zawartość zamówienia */}
                    <div className="rounded-lg border p-4">
                        <h2 className="mb-3 text-base font-medium">Zawartość zamówienia</h2>
                        <div className="flex flex-col gap-3">
                            <div className="grid gap-2 w-full">
                                <p className="text-sm text-foreground">Produkty</p>
                                <table className="w-full border-collapse border-2 border-gray-300">
                                    <thead>
                                        <tr>
                                            <th className="border-2 border-gray-300">Lp.</th>
                                            <th className="border-2 border-gray-300">Produkt</th>
                                            <th className="border-2 border-gray-300">Ilość</th>
                                            <th className="border-2 border-gray-300">Cena jedn.</th>
                                            <th className="border-2 border-gray-300">Cena całkowita</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order?.produkty?.map((produkt, index) => {
                                            const produktData = produkt.pozycja as Products;
                                            if (!produktData)
                                                return (
                                                    <tr key={`${index}`}>
                                                        <td className="border-2 border-gray-300">{index + 1}</td>
                                                        <td className="border-2 border-gray-300">Produkt został usunięty</td>
                                                        <td className="border-2 border-gray-300">{produkt.ilosc}</td>
                                                    </tr>
                                                )
                                            return (
                                                <tr key={produktData._id + `${index}`}>
                                                    <td className="border-2 border-gray-300">{index + 1}</td>
                                                    <td className="border-2 border-gray-300">{produktData.nazwa}</td>
                                                    <td className="border-2 border-gray-300">{produkt.ilosc}</td>
                                                    <td className="border-2 border-gray-300">{produktData.cena * (1 + produktData.vat / 100)}</td>
                                                    <td className="border-2 border-gray-300">{produktData.cena * produkt.ilosc}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="grid gap-2 w-full">
                                <p className="text-sm text-foreground">Kursy</p>
                                <table className="w-full border-collapse border-2 border-gray-300">
                                    <thead>
                                        <tr>
                                            <th className="border-2 border-gray-300">Lp.</th>
                                            <th className="border-2 border-gray-300">Kurs</th>
                                            <th className="border-2 border-gray-300">Ilość</th>
                                            <th className="border-2 border-gray-300">Cena jedn.</th>
                                            <th className="border-2 border-gray-300">Cena całkowita</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order?.kursy?.map((kurs, index) => {
                                            const kursData = kurs.pozycja as Courses;
                                            return (
                                                <tr key={kursData._id}>
                                                    <td className="border-2 border-gray-300">{index + 1}</td>
                                                    <td className="border-2 border-gray-300">{kursData.nazwa}</td>
                                                    <td className="border-2 border-gray-300">{kurs.ilosc}</td>
                                                    <td className="border-2 border-gray-300">{kursData.cena * (1 + kursData.vat / 100)}</td>
                                                    <td className="border-2 border-gray-300">{(kursData.cena * (1 + kursData.vat / 100)) * kurs.ilosc}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    {/* Pliki zamówienia */}
                    <div className="rounded-lg border p-4">
                        <h2 className="mb-3 text-base font-medium">Pliki zamówienia</h2>
                        <div className="flex flex-col gap-3">
                            <table className="w-full border-collapse border-2 border-gray-300">
                                <thead>
                                    <tr>
                                        <th className="border-2 border-gray-300">Lp.</th>
                                        <th className="border-2 border-gray-300">Typ</th>
                                        <th className="border-2 border-gray-300">Plik</th>
                                        <th className="border-2 border-gray-300">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order?.pliki?.map((plik, index) => {
                                        return (
                                            <tr key={index}>
                                                <td className="border-2 border-gray-300">{index + 1}</td>
                                                <td className="border-2 border-gray-300">{plik.typ.charAt(0).toUpperCase() + plik.typ.slice(1)}</td>
                                                <td className="border-2 border-gray-300">{plik.nazwa}</td>
                                                <td className="border-2 border-gray-300">
                                                    <Link href={plik.url} target="_blank" className="underline border-1 p-2 m-2 rounded-md hover:bg-gray-100 transition-colors text-center">Pobierz</Link>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    )
}