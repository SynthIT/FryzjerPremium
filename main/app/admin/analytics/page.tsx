"use client";

import AdminAnalyticsMain from "@/components/admin/AdminAnalyticsMain";
import { ChartBar } from "lucide-react";

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-gray-900 flex items-center gap-2 text-2xl font-semibold tracking-tight text-[var(--text-dark)] sm:text-3xl">
                    <ChartBar className="h-8 w-8 text-[var(--primary-dark)]" />
                    Analityka
                </h1>
                <p className="text-sm text-muted-foreground sm:text-base">
                    Wgląd w sprzedaż, ruch i skuteczność kampanii.
                </p>
            </div >
            <AdminAnalyticsMain />
        </div>
    )
}


