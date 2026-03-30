"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import StorefrontShell from "@/components/layout/StorefrontShell";
import LogowaniePageView from "./LogowaniePageView";
import {
    marketingPageContainer,
    marketingPageContent,
} from "@/components/site/marketingPageClasses";

function LogowanieWithRedirect() {
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") ?? undefined;
    return (
        <StorefrontShell redirectTo={redirectTo ?? undefined}>
            <LogowaniePageView />
        </StorefrontShell>
    );
}

function LogowanieFallback() {
    return (
        <StorefrontShell>
            <main className={marketingPageContainer}>
                <div className={`${marketingPageContent} animate-pulse`}>
                    <div className="h-14 bg-gray-200/50 rounded mb-10 w-3/4" />
                    <div className="h-5 bg-gray-200/50 rounded" />
                </div>
            </main>
        </StorefrontShell>
    );
}

export default function LogowanieScreen() {
    return (
        <Suspense fallback={<LogowanieFallback />}>
            <LogowanieWithRedirect />
        </Suspense>
    );
}
