"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AccountVerify,
    accountVerifyStatusLabels,
    AccountVerifyStatus,
} from "@/lib/types/accountVerifyTypes";
import { Building2, Check, X } from "lucide-react";

export default function AccountVerifyAdminPage() {
    const [requests, setRequests] = useState<AccountVerify[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | AccountVerifyStatus>("oczekujace");
    const [busyId, setBusyId] = useState<string | null>(null);
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch("/admin/api/v1/account-verify", {
                credentials: "include",
            });
            if (!res.ok) {
                setRequests([]);
                return;
            }
            const data = await res.json();
            setRequests(Array.isArray(data.requests) ? data.requests : []);
        } catch {
            setRequests([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(() => {
        if (filter === "all") return requests;
        return requests.filter((r) => r.status === filter);
    }, [requests, filter]);

    const review = async (
        id: string,
        action: "zaakceptowane" | "odrzucone",
        powod?: string,
    ) => {
        setBusyId(id);
        try {
            const res = await fetch("/admin/api/v1/account-verify", {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    action,
                    powod_odrzucenia: powod,
                }),
            });
            const data = await res.json();
            if (!res.ok || data.status !== 0) {
                alert(data.error || "Nie udało się zapisać decyzji.");
                return;
            }
            setRejectId(null);
            setRejectReason("");
            await load();
        } finally {
            setBusyId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-muted-foreground">Ładowanie wniosków...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-[var(--text-dark)] sm:text-3xl">
                    <Building2 className="h-8 w-8 text-[var(--primary-dark)]" />
                    Weryfikacja kont firmowych
                </h1>
                <p className="text-sm text-muted-foreground sm:text-base">
                    Akceptuj lub odrzucaj wnioski o lepsze promocje dla firm.
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                {(
                    [
                        ["oczekujace", "Oczekujące"],
                        ["zaakceptowane", "Zaakceptowane"],
                        ["odrzucone", "Odrzucone"],
                        ["all", "Wszystkie"],
                    ] as const
                ).map(([value, label]) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => setFilter(value)}
                        className={`rounded-md border px-3 py-1.5 text-sm ${
                            filter === value
                                ? "border-[var(--primary-dark)] bg-[var(--primary-dark)]/10 font-medium"
                                : "hover:bg-gray-50"
                        }`}>
                        {label}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <p className="rounded-lg border p-6 text-sm text-muted-foreground">
                    Brak wniosków w tej kategorii.
                </p>
            ) : (
                <div className="space-y-3">
                    {filtered.map((req) => {
                        const id = String(req._id);
                        const status = (req.status ??
                            "oczekujace") as AccountVerifyStatus;
                        return (
                            <div
                                key={id}
                                className="rounded-lg border bg-white p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-base font-semibold">
                                            {req.nazwa}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {req.email} · NIP {req.nip} ·{" "}
                                            {req.rodzaj_firmy}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Status:{" "}
                                            {accountVerifyStatusLabels[status]}
                                            {req.createdAt
                                                ? ` · złożono ${new Date(req.createdAt).toLocaleDateString("pl-PL")}`
                                                : ""}
                                        </p>
                                        {(req.adres || req.miasto) && (
                                            <p className="mt-1 text-sm">
                                                {[req.adres, req.kod_pocztowy, req.miasto, req.kraj]
                                                    .filter(Boolean)
                                                    .join(", ")}
                                            </p>
                                        )}
                                        {req.telefon && (
                                            <p className="text-sm">Tel: {req.telefon}</p>
                                        )}
                                        {status === "odrzucone" && req.powod_odrzucenia && (
                                            <p className="mt-2 text-sm text-red-600">
                                                Powód: {req.powod_odrzucenia}
                                            </p>
                                        )}
                                    </div>
                                    {status === "oczekujace" && (
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                disabled={busyId === id}
                                                onClick={() =>
                                                    review(id, "zaakceptowane")
                                                }
                                                className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-50">
                                                <Check className="h-4 w-4" />
                                                Akceptuj
                                            </button>
                                            <button
                                                type="button"
                                                disabled={busyId === id}
                                                onClick={() => {
                                                    setRejectId(id);
                                                    setRejectReason("");
                                                }}
                                                className="inline-flex items-center gap-1 rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50">
                                                <X className="h-4 w-4" />
                                                Odrzuć
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {rejectId === id && (
                                    <div className="mt-3 space-y-2 border-t pt-3">
                                        <label className="block text-sm font-medium">
                                            Powód odrzucenia
                                        </label>
                                        <textarea
                                            value={rejectReason}
                                            onChange={(e) =>
                                                setRejectReason(e.target.value)
                                            }
                                            className="w-full rounded-md border p-2 text-sm"
                                            rows={2}
                                            placeholder="Np. nieprawidłowy NIP, brak dokumentów..."
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                disabled={busyId === id}
                                                onClick={() =>
                                                    review(
                                                        id,
                                                        "odrzucone",
                                                        rejectReason,
                                                    )
                                                }
                                                className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50">
                                                Potwierdź odrzucenie
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setRejectId(null)}
                                                className="rounded-md border px-3 py-1.5 text-sm">
                                                Anuluj
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
