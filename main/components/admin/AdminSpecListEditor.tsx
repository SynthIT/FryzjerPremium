"use client";

import { Plus, Minus } from "lucide-react";
import { adminInputClass, adminModalInputClass } from "./adminFormStyles";

export type SpecRow = { key: string; value: string };

type Variant = "page" | "modal";

interface AdminSpecListEditorProps {
    items: SpecRow[];
    onChange: (items: SpecRow[]) => void;
    variant?: Variant;
    showHeader?: boolean;
    title?: string;
}

export default function AdminSpecListEditor({
    items,
    onChange,
    variant = "page",
    showHeader = true,
    title = "Specyfikacja",
}: AdminSpecListEditorProps) {
    const inputClass = variant === "page" ? adminInputClass : adminModalInputClass;

    const add = () => onChange([...items, { key: "", value: "" }]);
    const update = (index: number, field: "key" | "value", value: string) => {
        const next = [...items];
        next[index] = { ...next[index], [field]: value };
        onChange(next);
    };
    const remove = (index: number) => onChange(items.filter((_, i) => i !== index));

    const addBtnClass =
        variant === "page"
            ? "px-3 py-2 text-xs bg-primary border-2 text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-1"
            : "px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-1";

    return (
        <div className="space-y-2">
            {showHeader && (
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">{title}</label>
                    <button type="button" onClick={add} className={addBtnClass}>
                        <Plus className="h-3 w-3" />
                        Dodaj
                    </button>
                </div>
            )}
            {!showHeader && (
                <button type="button" onClick={add} className={addBtnClass}>
                    <Plus className={variant === "page" ? "h-3 w-3" : "h-4 w-4"} />
                    Dodaj
                </button>
            )}
            <div className="space-y-2">
                {items.map((spec, index) => (
                    <div key={index} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Klucz"
                            value={spec.key}
                            onChange={(e) => update(index, "key", e.target.value)}
                            className={`flex-1 ${inputClass}`}
                        />
                        <input
                            type="text"
                            placeholder="Wartość"
                            value={spec.value}
                            onChange={(e) => update(index, "value", e.target.value)}
                            className={`flex-1 ${inputClass}`}
                        />
                        <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                            <Minus className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
