"use client";
import { OrderList, getOrderStatusLabel } from "@/lib/types/orderTypes";
import TableOrderComponent from "./TableOrderComponent";
import { useEffect, useState } from "react";
import { formatLocaleDateTime } from "@/lib/dateFormat";
import { useCart } from "@/contexts/CartContext";
import { useUser } from "@/contexts/UserContext";
import { Users } from "@/lib/types/userTypes";
import Link from "next/link";
import { maskTrackingUrl, maskWaybillNumber } from "@/lib/apaczka/tracking";
import {
    marketingPageContainer,
    marketingPageContent,
    marketingPageTitle,
} from "@/components/site/marketingPageClasses";

const bodyText = "text-[17px] leading-[1.7] text-gray-700";
const sectionCard =
    "rounded-2xl border border-[rgba(212,196,176,0.35)] bg-white/70 p-5 sm:p-6";
const sectionHeading =
    "text-xl font-bold bg-gradient-to-br from-black to-[#3d3329] bg-clip-text text-transparent mb-4";
const actionBtn =
    "shrink-0 rounded-xl bg-[#D2B79B] px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#b89a7f]";

export default function OrderListPage({ order, redirected }: { order: OrderList; redirected: boolean }) {
    const { userData } = useUser();
    const { clearCart } = useCart();

    const [progress, setProgress] = useState(true);
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        function s() {
            if (userData) {
                if (userData.email == order.email) {
                    setProgress(false);
                    setLoading(false);
                }
            }
            if (redirected) {
                clearCart();
            }
        }
        s();
    }, [userData, order, redirected, clearCart]);

    const handleSubmit = () => {
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
    };

    if (loading) {
        return (
            <div className={marketingPageContainer}>
                <div className={marketingPageContent}>
                    <h2 className="text-2xl font-bold">Ładowanie...</h2>
                </div>
            </div>
        );
    }

    if (!redirected && progress) {
        return (
            <div className={marketingPageContainer}>
                <div className={`${marketingPageContent} max-w-[640px]`}>
                    <h2 className="mb-6 text-2xl font-bold bg-gradient-to-br from-black to-[#3d3329] bg-clip-text text-transparent">
                        Aby przejść dalej, podaj adres email z którego zostało złożone zamówienie
                    </h2>
                    <div className="flex flex-col gap-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#D2B79B] focus:outline-none focus:ring-1 focus:ring-[#D2B79B]"
                        />
                        <button type="button" className={actionBtn} onClick={handleSubmit}>
                            Przejść dalej
                        </button>
                    </div>
                    {error && <p className="mt-3 text-red-500">{error}</p>}
                </div>
            </div>
        );
    }

    if (!order.dane || !order.pliki) {
        return (
            <div className={marketingPageContainer}>
                <div className={marketingPageContent}>
                    <h2 className="text-2xl font-bold">Zamówienie nie istnieje</h2>
                </div>
            </div>
        );
    }

    const customer = order.dane as Partial<Users>;
    const suma = Number(order.suma ?? 0);
    const hasProducts = (order.produkty?.length ?? 0) > 0;
    const hasCourses = (order.kursy?.length ?? 0) > 0;
    const hasFiles = (order.pliki?.length ?? 0) > 0;

    return (
        <div className={marketingPageContainer}>
            <div className={marketingPageContent}>
                <h1 className={marketingPageTitle}>Zamówienie: {order?.numer_zamowienia}</h1>

                <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className={sectionCard}>
                        <h2 className={sectionHeading}>Informacje o zamówieniu</h2>
                        <dl className={`space-y-2 ${bodyText}`}>
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <dt className="text-gray-500">Status</dt>
                                <dd>
                                    <span className="inline-block rounded-md bg-[#f8f6f3] px-2.5 py-1 text-sm font-medium text-[#3d3329]">
                                        {getOrderStatusLabel(order?.status)}
                                    </span>
                                </dd>
                            </div>
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <dt className="text-gray-500">Data zamówienia</dt>
                                <dd>{formatLocaleDateTime(order?.data_zamowienia ?? null)}</dd>
                            </div>
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <dt className="text-gray-500">Data wysłania</dt>
                                <dd>{formatLocaleDateTime(order?.data_wyslania ?? null)}</dd>
                            </div>
                        </dl>
                        {order.apaczka?.tracking_url && (
                            <div className="mt-5 border-t border-[rgba(212,196,176,0.25)] pt-4 space-y-2">
                                <p className="text-sm font-medium text-[#3d3329]">
                                    Śledzenie przesyłki
                                </p>
                                {order.apaczka.waybill_number && (
                                    <p className="text-sm text-gray-600">
                                        Numer listu:{" "}
                                        <span className="font-mono">
                                            {maskWaybillNumber(order.apaczka.waybill_number)}
                                        </span>
                                    </p>
                                )}
                                <a
                                    href={order.apaczka.tracking_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-block text-sm font-medium text-[#D2B79B] hover:text-[#b89a7f] break-all"
                                    title="Otwórz pełny link śledzenia">
                                    {maskTrackingUrl(order.apaczka.tracking_url)}
                                </a>
                                <p className="text-xs text-gray-500">
                                    Link zapisany w zamówieniu — kliknij, aby śledzić paczkę.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className={sectionCard}>
                        <h2 className={sectionHeading}>Dane klienta</h2>
                        <dl className={`space-y-2 ${bodyText}`}>
                            <div className="flex flex-wrap justify-between gap-2">
                                <dt className="text-gray-500">Imię i nazwisko</dt>
                                <dd>
                                    {customer.imie} {customer.nazwisko}
                                </dd>
                            </div>
                            <div className="flex flex-wrap justify-between gap-2">
                                <dt className="text-gray-500">Email</dt>
                                <dd className="break-all">{customer.email}</dd>
                            </div>
                            <div className="flex flex-wrap justify-between gap-2">
                                <dt className="text-gray-500">Telefon</dt>
                                <dd>{customer.telefon}</dd>
                            </div>
                            <div className="flex flex-wrap justify-between gap-2">
                                <dt className="text-gray-500">Adres</dt>
                                <dd className="text-right">
                                    {customer.ulica}, {customer.kod_pocztowy} {customer.miasto},{" "}
                                    {customer.kraj}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <div className="space-y-8">
                    {hasProducts && (
                        <section>
                            <h2 className={sectionHeading}>Produkty</h2>
                            <TableOrderComponent order={order} type="products" />
                        </section>
                    )}

                    {hasCourses && (
                        <section>
                            <h2 className={sectionHeading}>Kursy</h2>
                            <TableOrderComponent order={order} type="courses" />
                        </section>
                    )}
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(212,196,176,0.35)] pt-6">
                    <h2 className="text-xl font-bold text-gray-900">Suma zamówienia</h2>
                    <p className="text-2xl font-semibold text-[#3d3329]">{suma.toFixed(2)} zł</p>
                </div>

                {hasFiles && (
                    <section className="mt-8">
                        <h2 className={sectionHeading}>Pliki dołączone do zamówienia</h2>
                        <ul className="flex flex-col gap-2">
                            {order.pliki.map((plik) => (
                                <li key={plik.nazwa}>
                                    <Link
                                        href={plik.url}
                                        target="_blank"
                                        className="font-medium text-[#D2B79B] no-underline hover:text-[#b89a7f]">
                                        {plik.nazwa}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className={`${sectionCard} mt-10`}>
                    <h2 className={sectionHeading}>
                        Masz wątpliwości co do zamówienia? Skontaktuj się z nami
                    </h2>
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-3 border-t border-[rgba(212,196,176,0.25)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <button type="button" className={actionBtn}>
                                Szybki zwrot
                            </button>
                            <p className={`sm:w-2/3 ${bodyText}`}>
                                Jeżeli się rozmyśliłeś z zakupu, skorzystaj z guzika obok. Więcej
                                informacji w regulaminie zwrotów.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 border-t border-[rgba(212,196,176,0.25)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <button type="button" className={actionBtn}>
                                Zgłoś reklamacje
                            </button>
                            <p className={`sm:w-2/3 ${bodyText}`}>
                                Jeżeli produkt który zamówiłeś/aś jest niezgodny z oczekiwaniami,
                                skorzystaj z guzika obok. Więcej informacji w regulaminie reklamacji.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 border-t border-[rgba(212,196,176,0.25)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <button type="button" className={actionBtn}>
                                Zwróć usługę
                            </button>
                            <p className={`sm:w-2/3 ${bodyText}`}>
                                Jeżeli usługa którą zamówiłeś/aś jest niezgodna z oczekiwaniami,
                                skorzystaj z guzika obok. Więcej informacji w regulaminie zwrotów.
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 border-t border-[rgba(212,196,176,0.25)] pt-5">
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">Lub zadzwoń do nas</h3>
                        <p className={bodyText}>
                            Jeżeli masz dodatkowe pytania, lub potrzebujesz dodatkowych informacji,
                            zadzwoń do nas.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
