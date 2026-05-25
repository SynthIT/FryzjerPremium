"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils_admin";

/** Siatka 2 kolumn na stronach „new” / edycji w panelu admin. */
export const adminFormPageGrid =
    "grid grid-cols-1 lg:grid-cols-2 gap-4 items-start";

/** Sekcja na pełną szerokość (warianty, submit, długie listy). */
export const adminFormSpanFull = "lg:col-span-2";

export const adminModalOverlay =
    "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4";

export const adminModalPanel =
    "bg-background rounded-xl shadow-2xl w-full max-w-[min(96vw,1280px)] max-h-[92vh] overflow-hidden flex flex-col border";

export const adminModalBodyGrid =
    "grid grid-cols-1 md:grid-cols-2 gap-4 items-start";

type AdminFormSectionProps = {
    title: string;
    icon?: LucideIcon;
    children: React.ReactNode;
    className?: string;
    /** Mniejszy padding — modale / gęstszy układ */
    dense?: boolean;
};

export function AdminFormSection({
    title,
    icon: Icon,
    children,
    className,
    dense = false,
}: AdminFormSectionProps) {
    return (
        <section
            className={cn(
                "rounded-lg border bg-card/40 shadow-sm h-full",
                dense ? "p-4 space-y-3" : "p-5 space-y-4",
                className,
            )}>
            <h2 className="text-base font-semibold flex items-center gap-2 tracking-tight">
                {Icon ? (
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : null}
                {title}
            </h2>
            <div className="space-y-4">{children}</div>
        </section>
    );
}
