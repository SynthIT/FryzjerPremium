"use client";

import { useState, useCallback, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/app/globals.css";
import { DeliveryMethods } from "@/lib/types/deliveryTypes";
import DeliveryMethod from "@/components/checkout/DeliveryMethods";

export default function CheckoutPage() {
    const { cartItems, getTotalPrice } = useCart();
    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethods[]>();
    const [selectedDeliveryMethod, setSelectDeliveryMethod] =
        useState<DeliveryMethods>();
    const [paymentMethod, setPaymentMethod] = useState("card");
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
        async function delivery() {
            const response = await fetch("/api/v1/products/delivery", {
                method: "GET",
            }).then((res) => res.json());
            setDeliveryMethod(response);
            setSelectDeliveryMethod(deliveryMethod![0]);
        }
        delivery();
    }, [deliveryMethod]);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
        },
        []
    );

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        // Tutaj można dodać logikę wysłania zamówienia
        alert("Zamówienie zostało złożone!");
    }, []);

    const subtotal = getTotalPrice();
    const deliveryFee = selectedDeliveryMethod?.ceny[0].cena;
    const total = subtotal + 123;

    const formattedSubtotal = subtotal.toFixed(2).replace(".", ",");
    const formattedDeliveryFee = (deliveryFee || 1230.11)
        .toFixed(2)
        .replace(".", ",");
    const formattedTotal = total.toFixed(2).replace(".", ",");

    if (cartItems.length === 0) {
        return (
            <>
                <Header />
                <div className="checkout-page">
                    <div className="checkout-page-container">
                        <div className="checkout-empty">
                            <h2>Twój koszyk jest pusty</h2>
                            <p>Dodaj produkty do koszyka, aby kontynuować.</p>
                            <Link
                                href="/products"
                                className="checkout-empty-button">
                                Przejdź do sklepu
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
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
                                            <label htmlFor="phone">
                                                Telefon *
                                            </label>
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
                                            <label htmlFor="city">
                                                Miasto *
                                            </label>
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
                                            <option value="Polska">
                                                Polska
                                            </option>
                                            <option value="Niemcy">
                                                Niemcy
                                            </option>
                                            <option value="Czechy">
                                                Czechy
                                            </option>
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
                                            deliveryMethod.map(
                                                (delivery, i) => (
                                                    <DeliveryMethod
                                                        key={i}
                                                        deliverMethod=""
                                                        deliver={delivery}
                                                        price={123}
                                                        onSelect={(w) =>
                                                            setSelectDeliveryMethod(
                                                                w
                                                            )
                                                        }></DeliveryMethod>
                                                )
                                            )}
                                    </div>
                                </section>

                                {/* Metoda płatności */}
                                <section className="checkout-section">
                                    <h2 className="checkout-section-title">
                                        Metoda płatności
                                    </h2>
                                    <div className="checkout-payment-options">
                                        <label
                                            className={`checkout-payment-option ${
                                                paymentMethod === "card"
                                                    ? "active"
                                                    : ""
                                            }`}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="card"
                                                checked={
                                                    paymentMethod === "card"
                                                }
                                                onChange={(e) =>
                                                    setPaymentMethod(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <div className="checkout-payment-info">
                                                <strong>
                                                    Karta kredytowa/debetowa
                                                </strong>
                                                <p>Płatność online</p>
                                            </div>
                                        </label>

                                        <label
                                            className={`checkout-payment-option ${
                                                paymentMethod === "blik"
                                                    ? "active"
                                                    : ""
                                            }`}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="blik"
                                                checked={
                                                    paymentMethod === "blik"
                                                }
                                                onChange={(e) =>
                                                    setPaymentMethod(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <div className="checkout-payment-info">
                                                <strong>BLIK</strong>
                                                <p>Płatność mobilna</p>
                                            </div>
                                        </label>

                                        <label
                                            className={`checkout-payment-option ${
                                                paymentMethod === "transfer"
                                                    ? "active"
                                                    : ""
                                            }`}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="transfer"
                                                checked={
                                                    paymentMethod === "transfer"
                                                }
                                                onChange={(e) =>
                                                    setPaymentMethod(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <div className="checkout-payment-info">
                                                <strong>Przelew bankowy</strong>
                                                <p>Opłata przy odbiorze</p>
                                            </div>
                                        </label>
                                    </div>
                                </section>
                            </form>
                        </div>

                        {/* Sidebar z podsumowaniem */}
                        <aside className="checkout-sidebar">
                            <div className="checkout-summary">
                                <h2 className="checkout-summary-title">
                                    Podsumowanie zamówienia
                                </h2>

                                <div className="checkout-items">
                                    {cartItems.map((item) => {
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
                                                                    .media[0]
                                                                    .path
                                                            }
                                                            alt={
                                                                item.product
                                                                    .media[0]
                                                                    .nazwa
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
                                                        {item.product.cena} zł
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
                                    <span>{formattedSubtotal} zł</span>
                                </div>

                                <div className="checkout-summary-row">
                                    <span>Koszt dostawy</span>
                                    <span>
                                        {deliveryFee > 0
                                            ? `${formattedDeliveryFee} zł`
                                            : "Gratis"}
                                    </span>
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

                                <Link
                                    href="/cart"
                                    className="checkout-back-link">
                                    ← Wróć do koszyka
                                </Link>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
