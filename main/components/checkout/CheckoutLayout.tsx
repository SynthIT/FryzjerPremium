import { useState, useCallback, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import {CartItem } from "@/lib/types/cartTypes";
import Image from "next/image";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/Payments";
import { Elements } from "@stripe/react-stripe-js";
import { DeliveryMethods } from "@/lib/types/deliveryTypes";
import DeliveryMethod from "@/components/checkout/DeliveryMethods";
import { EmptyCart } from "@/components/cart/EmptyCard";
import { Stripe } from "@stripe/stripe-js";

interface Props {
    stripePromise: Promise<Stripe | null>;
}

export function Checkout({ stripePromise }: Props) {
    const { getCart, getTotalPrice } = useCart();
    const [{ id, items }, _] = useState<{ id: string; items: CartItem[] }>(
        getCart(),
    );
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
            const deliverFee = selectedDeliveryMethod.ceny[0].cena;
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

    if (items.length === 0) {
        return <EmptyCart />;
    }

    return (
        <div className="checkout-page">
            <div className="checkout-page-container">
                <div className="breadcrumbs">
                    <Link href="/" className="breadcrumb-link">
                        Strona główna
                    </Link>
                    <span className="breadcrumb-separator">&gt;</span>
                    <Link href="/cart" className="breadcrumb-link">
                        Koszyk
                    </Link>
                    <span className="breadcrumb-separator">&gt;</span>
                    <span className="breadcrumb-current">Kasa</span>
                </div>

                <h1 className="checkout-title">Kasa</h1>

                <div className="checkout-content">
                    <div className="checkout-main">
                        <form
                            id="checkout-form"
                            onSubmit={handleSubmit}
                            className="checkout-form">
                            {/* Dane kontaktowe */}
                            <section className="checkout-section">
                                <h2 className="checkout-section-title">
                                    Dane kontaktowe
                                </h2>
                                <div className="checkout-form-row">
                                    <div className="checkout-form-field">
                                        <label htmlFor="firstName">
                                            Imię *
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="checkout-form-field">
                                        <label htmlFor="lastName">
                                            Nazwisko *
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="checkout-form-row">
                                    <div className="checkout-form-field">
                                        <label htmlFor="email">
                                            Adres e-mail *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="checkout-form-field">
                                        <label htmlFor="phone">Telefon *</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Adres dostawy */}
                            <section className="checkout-section">
                                <h2 className="checkout-section-title">
                                    Adres dostawy
                                </h2>
                                <div className="checkout-form-field">
                                    <label htmlFor="street">
                                        Ulica i numer *
                                    </label>
                                    <input
                                        type="text"
                                        id="street"
                                        name="street"
                                        value={formData.street}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="checkout-form-row">
                                    <div className="checkout-form-field">
                                        <label htmlFor="postalCode">
                                            Kod pocztowy *
                                        </label>
                                        <input
                                            type="text"
                                            id="postalCode"
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleInputChange}
                                            pattern="[0-9]{2}-[0-9]{3}"
                                            placeholder="00-000"
                                            required
                                        />
                                    </div>
                                    <div className="checkout-form-field">
                                        <label htmlFor="city">Miasto *</label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="checkout-form-field">
                                    <label htmlFor="country">Kraj *</label>
                                    <select
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
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
                            <section className="checkout-section">
                                <h2 className="checkout-section-title">
                                    Metoda dostawy
                                </h2>
                                <div className="checkout-delivery-options">
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

                        {/* Metoda płatności */}
                        <section className="checkout-section">
                            <h2 className="checkout-section-title">
                                Metoda płatności
                            </h2>
                            {cs ? (
                                <Elements
                                    stripe={stripePromise}
                                    options={{
                                        clientSecret: cs,
                                        appearance: { theme: "flat" },
                                    }}>
                                    <CheckoutForm></CheckoutForm>
                                </Elements>
                            ) : null}
                        </section>
                    </div>

                    {/* Sidebar z podsumowaniem */}
                    <aside className="checkout-sidebar">
                        <div className="checkout-summary">
                            <h2 className="checkout-summary-title">
                                Podsumowanie zamówienia
                            </h2>

                            <div className="checkout-items">
                                {items.map((item) => {
                                    const itemTotal = (
                                        item.price * item.quantity
                                    )
                                        .toFixed(2)
                                        .replace(".", ",");

                                    return (
                                        <div
                                            key={item.id}
                                            className="checkout-item">
                                            <div className="checkout-item-image">
                                                {item.product.media ? (
                                                    <Image
                                                        src={
                                                            item.product
                                                                .media[0].path
                                                        }
                                                        alt={
                                                            item.product
                                                                .media[0].nazwa
                                                        }
                                                        width={60}
                                                        height={60}
                                                        className="checkout-item-img"
                                                    />
                                                ) : null}
                                            </div>
                                            <div className="checkout-item-details">
                                                <div className="checkout-item-name">
                                                    {item.product.nazwa}
                                                </div>
                                                <div className="checkout-item-meta">
                                                    {item.quantity}x{" "}
                                                    {item.price} zł
                                                </div>
                                            </div>
                                            <div className="checkout-item-total">
                                                {itemTotal} zł
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="checkout-summary-row">
                                <span>Suma częściowa</span>
                                <span>
                                    {subtotal.toFixed(2).replace(".", ",")} zł
                                </span>
                            </div>

                            <div className="checkout-summary-row">
                                <span>Koszt dostawy</span>
                                <span>{deliverFee}</span>
                            </div>

                            <div className="checkout-summary-divider"></div>

                            <div className="checkout-summary-row checkout-summary-total">
                                <span>Razem</span>
                                <span>{formattedTotal} zł</span>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                className="checkout-submit-button">
                                Złóż zamówienie
                            </button>

                            <Link href="/cart" className="checkout-back-link">
                                ← Wróć do koszyka
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

