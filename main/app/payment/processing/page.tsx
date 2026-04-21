"use client";
import StorefrontShell from "@/components/layout/StorefrontShell";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import ProcessingPageView from "@/components/platnosci/ProcessingPageView";
import { useRouter } from "next/navigation";

export default function ProcessingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const payment_intent = searchParams.get("payment_intent");

    useEffect(() => {
        const checkPayment = async (interval: NodeJS.Timeout) => {
            const response = await fetch(`/api/v1/payments/check?payment_intent=${payment_intent}`);
            const data = await response.json();
            if (data.done) {
                clearInterval(interval);
                router.push(`/zamowienie/${data.nrzam}?redirected=true`);
            }
        }
        const interval = setInterval(() => {
            checkPayment(interval);
        }, 3000);
    }, [payment_intent, router]);
    return (
        <>
            <StorefrontShell>
                <ProcessingPageView />
            </StorefrontShell>
        </>
    )
}