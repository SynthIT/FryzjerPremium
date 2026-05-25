"use client";
import StorefrontShell from "@/components/layout/StorefrontShell";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import ProcessingPageView from "@/components/platnosci/ProcessingPageView";

function ProcessingPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const payment_intent = searchParams.get("payment_intent");

    const routerRef = useRef(router);
    const paymentIntentRef = useRef(payment_intent);

    useEffect(() => {
        routerRef.current = router;
        paymentIntentRef.current = payment_intent;
    }, [router, payment_intent]);

    useEffect(() => {
        if (!paymentIntentRef.current) return;
        const checkPayment = async (interval: NodeJS.Timeout) => {
            const response = await fetch(`/api/v1/payments/check?payment_intent=${paymentIntentRef.current}`);
            const data = await response.json();
            if (data.done) {
                routerRef.current.push(`/zamowienie/${data.nrzam}?redirected=true`);
                clearInterval(interval);
            }
        }
        const interval = setInterval(() => {
            checkPayment(interval);
        }, 5000);

        return () => {
            clearInterval(interval);
            console.log("Clearing interval");
        }
    }, [paymentIntentRef]);
    return (
        <StorefrontShell>
            <ProcessingPageView />
        </StorefrontShell>
    );
}

export default function ProcessingPage() {
    return (
        <Suspense
            fallback={
                <StorefrontShell>
                    <ProcessingPageView />
                </StorefrontShell>
            }
        >
            <ProcessingPageContent />
        </Suspense>
    );
}