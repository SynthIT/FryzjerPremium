import {
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { useState } from "react";

export function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return; // Strażnicy jeszcze nie gotowi

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/api/v1/payments/succceded`, // Po udanej płatności przekieruj tutaj
            },
        });

        if (error) {
            setMessage(
                error.message ?? "Coś pękło, mordo... znaczy, mości panie.",
            );
        }
    };

    return (
        <>
            {/* Ten komponent sam wyświetli BLIK, Kartę i inne, co tam w Intent ustawisz */}
            <form onSubmit={handleSubmit}>
                <PaymentElement />
                <button
                    disabled={!stripe}
                    className="bg-red-600 text-white px-4 py-2 rounded shadow-lg hover:bg-red-700 w-full">
                    Daj ognia (Zapłać)
                </button>
                {message && <div className="text-red-500 mt-2">{message}</div>}
            </form>
        </>
    );
}

