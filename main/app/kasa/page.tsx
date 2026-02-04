"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/app/globals.css";
import { loadStripe } from "@stripe/stripe-js";
import { Checkout } from "@/components/checkout/CheckoutLayout";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_PUBLICISHABLE_STRIPE!)
    .then((stripe) => {
        return stripe;
    })
    .catch((error) => {
        console.error("Błąd ładowania Stripe:", error);
        return null;
    });

export default function CheckoutPage() {
    return (
        <>
            <Header />
            <Checkout stripePromise={stripePromise} />
            <Footer />
        </>
    );
}
