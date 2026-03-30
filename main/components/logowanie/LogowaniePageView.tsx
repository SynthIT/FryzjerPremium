"use client";

import { User } from "lucide-react";
import {
    marketingPageContainer,
    marketingPageContent,
    marketingPageText,
    marketingPageTitle,
} from "@/components/site/marketingPageClasses";

export default function LogowaniePageView() {
    return (
        <main className={marketingPageContainer}>
            <div className={marketingPageContent}>
                <h2 className={marketingPageTitle}>Zaloguj sie, aby kontynuować</h2>
                <p className={`flex items-center gap-2 ${marketingPageText}`}>
                    Zaloguj się do swojego konta, używając guzika{" "}
                    <User className="w-6 h-6 shrink-0" aria-hidden /> w prawym górnym rogu strony.
                </p>
            </div>
        </main>
    );
}
