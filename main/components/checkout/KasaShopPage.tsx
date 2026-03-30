"use client";

import StorefrontShell from "@/components/layout/StorefrontShell";
import { loadStripe } from "@stripe/stripe-js";
import { Checkout } from "./CheckoutLayout";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_PUBLISHABLE_STRIPE!)
    .then((stripe) => stripe)
    .catch((error) => {
        console.error("Błąd ładowania Stripe:", error);
        return null;
    });

export default function KasaShopPage() {
    return (
        <StorefrontShell>
            {stripePromise ?
                (<Checkout stripePromise={stripePromise} />)
                :
                (<div className="text-center text-gray-500">Brak połączenia z Stripe lub wystąpił nieoczekiwany błąd. Odśwież stronę i spróbuj ponownie.</div>)}
        </StorefrontShell>
    );
}
