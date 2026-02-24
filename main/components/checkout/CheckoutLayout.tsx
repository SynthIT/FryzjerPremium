import { useState, useCallback, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { CartItem } from "@/lib/types/cartTypes";
import Image from "next/image";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/Payments";
import { Elements } from "@stripe/react-stripe-js";
import { DeliveryMethods } from "@/lib/types/deliveryTypes";
import DeliveryMethod from "@/components/checkout/DeliveryMethods";
import { EmptyCart } from "@/components/cart/EmptyCard";
import { Stripe } from "@stripe/stripe-js";
import { createPortal } from "react-dom";
import { useUser } from "@/contexts/UserContext";

interface Props {
    stripePromise: Promise<Stripe | null>;
}

export function Checkout({ stripePromise }: Props) {
    const { getCart, getTotalPrice } = useCart();
    const [{ id, items }, _] = useState<{ id: string; items: CartItem[] }>(
        getCart(),
    );
    const [handlePayment, setHandlePayment] = useState<boolean>(false);
    const [cs, setCs] = useState<string | null>(null);
    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethods[]>();
    const [selectedDeliveryMethod, setSelectDeliveryMethod] =
        useState<DeliveryMethods>();
    const [total, setTotal] = useState<number>(0);
    const [subtotal, setSubtotal] = useState<number>(0);
    const [deliverFee, setDeliverFee] = useState<number>(0);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        street: "",
        city: "",
        postalCode: "",
        country: "Polska",
    });

    const { userData } = useUser();
    useEffect(() => {
        async function as() {
            const response = await fetch("/api/v1/products/delivery", {
                method: "GET",
                cache: "force-cache",
            }).then((res) => res.json());
            setDeliveryMethod(response.delivery);
            setSelectDeliveryMethod(response.delivery[0]);
        }
        as();
    }, []);

    useEffect(() => {
        if (userData) {
            return setFormData((prev) => ({ ...prev, firstName: userData.imie, lastName: userData.nazwisko, email: userData.email, phone: userData.telefon, street: userData.ulica, city: userData.miasto, postalCode: userData.kod_pocztowy, country: userData.kraj }));
        }
    }, [userData]);


    useEffect(() => {
        async function getClientSecret() {
            const response = await fetch("/api/v1/payments", {
                method: "POST",
                body: JSON.stringify({ koszyk: id, produkty: items }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            setCs(data.client_secret);
        }
        getClientSecret();
    }, [id, items]);

    useEffect(() => {
        function a() {
            if (!selectedDeliveryMethod) return;
            const total = getTotalPrice();
            const deliverFee = selectedDeliveryMethod.rozmiary[0].cena;
            setSubtotal(total);
            setTotal(total + deliverFee);
            setDeliverFee(deliverFee);
        }
        a();
    }, [selectedDeliveryMethod, getTotalPrice]);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
        },
        [],
    );

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        // Tutaj można dodać logikę wysłania zamówienia
        alert("Zamówienie zostało złożone!");
    }, []);

    const formattedTotal = total.toFixed(2).replace(".", ",");
    const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 outline-none";
    const labelClass = "text-sm font-medium text-gray-700";

    if (items.length === 0) {
        return <EmptyCart />;
    }

    return (
        <div className="min-h-screen pt-[120px] pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1200px] mx-auto">
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-6">
                    <Link href="/" className="text-[#D2B79B] hover:underline">Strona główna</Link>
                    <span>&gt;</span>
                    <Link href="/cart" className="text-[#D2B79B] hover:underline">Koszyk</Link>
                    <span>&gt;</span>
                    <span className="text-gray-900">Kasa</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-black mb-8">Kasa</h1>
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 min-w-0">
                        <form
                            id="checkout-form"
                            onSubmit={handleSubmit}
                            className="space-y-6">
                            {/* Dane kontaktowe */}
                            <section className="rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">
                                    Dane kontaktowe
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label htmlFor="firstName" className={labelClass}>
                                            Imię *
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className={inputClass}
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label htmlFor="lastName" className={labelClass}>
                                            Nazwisko *
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className={inputClass}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label htmlFor="email" className={labelClass}>
                                            Adres e-mail *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={inputClass}
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label htmlFor="phone" className={labelClass}>Telefon *</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className={inputClass}
                                            required
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Adres dostawy */}
                            <section className="rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">
                                    Adres dostawy
                                </h2>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="street" className={labelClass}>
                                        Ulica i numer *
                                    </label>
                                    <input
                                        type="text"
                                        id="street"
                                        name="street"
                                        value={formData.street}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label htmlFor="postalCode" className={labelClass}>
                                            Kod pocztowy *
                                        </label>
                                        <input
                                            type="text"
                                            id="postalCode"
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleInputChange}
                                            className={inputClass}
                                            pattern="[0-9]{2}-[0-9]{3}"
                                            placeholder="00-000"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label htmlFor="city" className={labelClass}>Miasto *</label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className={inputClass}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="country" className={labelClass}>Kraj *</label>
                                    <select
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        required>
                                        <option value="Polska">Polska</option>
                                        <option value="Niemcy">Niemcy</option>
                                        <option value="Czechy">Czechy</option>
                                        <option value="Słowacja">
                                            Słowacja
                                        </option>
                                    </select>
                                </div>
                            </section>

                            {/* Metoda dostawy */}
                            <section className="rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">
                                    Metoda dostawy
                                </h2>
                                <div className="space-y-3">
                                    {deliveryMethod &&
                                        deliveryMethod.map((delivery, i) => (
                                            <DeliveryMethod
                                                key={i}
                                                deliver={delivery}
                                                selectedWariant={
                                                    selectedDeliveryMethod!
                                                }
                                                price={total}
                                                onSelect={(w) => {
                                                    setSelectDeliveryMethod(w);
                                                }}></DeliveryMethod>
                                        ))}
                                </div>
                            </section>
                        </form>
                    </div>

                    {/* Sidebar z podsumowaniem */}
                    <aside className="lg:w-96 shrink-0">
                        <div className="rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">
                                Podsumowanie zamówienia
                            </h2>

                            <div className="space-y-3 mb-4">
                                {items.map((item) => {
                                    const itemTotal = (
                                        item.price * item.quantity
                                    )
                                        .toFixed(2)
                                        .replace(".", ",");

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex gap-3 p-3 rounded-lg bg-gray-50">
                                            <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-gray-200">
                                                {item.product.media && item.product.media.length > 0 ? (
                                                    <Image
                                                        src={
                                                            item.product
                                                                .media[0]?.path
                                                        }
                                                        alt={
                                                            item.product
                                                                .media[0]?.alt
                                                        }
                                                        width={60}
                                                        height={60}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : null}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium text-gray-900 truncate text-sm">
                                                    {item.product.nazwa}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {item.quantity}x{" "}
                                                    {item.price} zł
                                                </div>
                                            </div>
                                            <div className="font-semibold text-[#D2B79B] text-sm">
                                                {itemTotal} zł
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex justify-between py-2 text-sm">
                                <span>Suma częściowa</span>
                                <span>
                                    {subtotal.toFixed(2).replace(".", ",")} zł
                                </span>
                            </div>

                            <div className="flex justify-between py-2 text-sm">
                                <span>Koszt dostawy</span>
                                <span>{deliverFee}</span>
                            </div>

                            <div className="border-t border-gray-200 my-4"></div>

                            <div className="flex justify-between py-2 font-bold text-base">
                                <span>Razem</span>
                                <span>{formattedTotal} zł</span>
                            </div>

                            <button
                                onClick={() => setHandlePayment(true)}
                                type="submit"
                                className="w-full py-3 rounded-xl font-semibold bg-[#D2B79B] text-black hover:bg-[#b89a7f] transition-colors disabled:opacity-50">
                                Złóż zamówienie
                            </button>

                            <Link href="/cart" className="block text-center py-2 text-sm text-[#D2B79B] hover:underline mt-2">
                                ← Wróć do koszyka
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
            {handlePayment && (
                <div className="mt-8 rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60 p-6">
                    <Elements
                        stripe={stripePromise}
                        options={{
                            clientSecret: cs,
                            appearance: { theme: "flat" },
                        }}>
                        <CheckoutForm></CheckoutForm>
                    </Elements>
                </div>
            )}
        </div>
    );
}
