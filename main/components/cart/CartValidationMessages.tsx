"use client";

import { CartItem } from "@/lib/types/cartTypes";
import { AlertCircle, Info, Package, Tag, X } from "lucide-react";
import { useMemo } from "react";

export type CartChangeEntry = { reason: string; item: CartItem };

type MessageKind = "removed" | "price" | "quantity" | "info";

function classifyChange(reason: string): MessageKind {
    const r = reason.toLowerCase();
    if (r.includes("usunięta") || r.includes("niedostępn")) return "removed";
    if (r.includes("cen")) return "price";
    if (r.includes("ilość") || r.includes("dostępn")) return "quantity";
    return "info";
}

const kindStyles: Record<
    MessageKind,
    { border: string; bg: string; icon: typeof Info; iconClass: string }
> = {
    removed: {
        border: "border-red-200",
        bg: "bg-red-50/90",
        icon: AlertCircle,
        iconClass: "text-red-600",
    },
    price: {
        border: "border-amber-200",
        bg: "bg-amber-50/90",
        icon: Tag,
        iconClass: "text-amber-700",
    },
    quantity: {
        border: "border-[rgba(212,196,176,0.6)]",
        bg: "bg-[#f8f6f3]",
        icon: Package,
        iconClass: "text-[#8b7355]",
    },
    info: {
        border: "border-blue-200",
        bg: "bg-blue-50/90",
        icon: Info,
        iconClass: "text-blue-600",
    },
};

function itemLabel(item: CartItem): string {
    const base = item.object.nazwa;
    if (item.wariant?.nazwa) return `${base} (${item.wariant.nazwa})`;
    return base;
}

function dedupeEntries(entries: CartChangeEntry[]): CartChangeEntry[] {
    const seen = new Set<string>();
    const out: CartChangeEntry[] = [];
    for (const e of entries) {
        const key = `${e.item.id}|${e.reason}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(e);
    }
    return out;
}

type CartValidationMessagesProps = {
    messages: CartChangeEntry[];
    onDismiss?: () => void;
};

export default function CartValidationMessages({
    messages,
    onDismiss,
}: CartValidationMessagesProps) {
    const lines = useMemo(() => dedupeEntries(messages), [messages]);

    if (lines.length === 0) return null;

    const hasRemoved = lines.some((l) => classifyChange(l.reason) === "removed");
    const title = hasRemoved
        ? "Zaktualizowaliśmy Twój koszyk"
        : "Koszyk wymaga uwagi";

    return (
        <div
            role="status"
            aria-live="polite"
            className="mb-6 rounded-xl border border-[rgba(212,196,176,0.45)] bg-white/80 shadow-sm overflow-hidden">
            <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-[rgba(212,196,176,0.25)] bg-[#f8f6f3]/80">
                <div>
                    <p className="font-semibold text-gray-900 text-sm">{title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                        Ceny lub dostępność mogły się zmienić od ostatniej wizyty.
                    </p>
                </div>
                {onDismiss && (
                    <button
                        type="button"
                        onClick={onDismiss}
                        className="shrink-0 p-1.5 rounded-md text-gray-500 hover:bg-gray-200/80 hover:text-gray-800 transition-colors"
                        aria-label="Zamknij komunikat">
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
            <ul className="divide-y divide-[rgba(212,196,176,0.2)] max-h-48 overflow-y-auto">
                {lines.map((entry, i) => {
                    const kind = classifyChange(entry.reason);
                    const style = kindStyles[kind];
                    const Icon = style.icon;
                    return (
                        <li
                            key={`${entry.item.id}-${i}`}
                            className={`flex gap-3 px-4 py-3 text-sm ${style.bg}`}>
                            <Icon
                                className={`h-4 w-4 shrink-0 mt-0.5 ${style.iconClass}`}
                                aria-hidden
                            />
                            <div className="min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                    {itemLabel(entry.item)}
                                </p>
                                <p className="text-gray-600 mt-0.5 leading-snug">
                                    {entry.reason}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
