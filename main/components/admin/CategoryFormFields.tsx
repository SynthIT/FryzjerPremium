"use client";

import { Categories } from "@/lib/types/shared";

export type CategoryFormData = Omit<
    Categories,
    "_id" | "__v" | "createdAt" | "updatedAt" | "image"
> & {
    _id?: string;
    nowa_nazwa?: string;
};

interface CategoryFormFieldsProps {
    categoryData: CategoryFormData;
    onChange: (data: CategoryFormData) => void;
    mainCategories: string[];
    existingCategories: Record<string, Categories[]>;
    formCls?: string;
    /** Etykieta pola nazwy (new: Podkategoria, edit: Nazwa) */
    nameLabel?: string;
}

const defaultFormCls =
    "w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]";

export default function CategoryFormFields({
    categoryData,
    onChange,
    mainCategories,
    existingCategories,
    formCls = defaultFormCls,
    nameLabel = "Podkategoria",
}: CategoryFormFieldsProps) {
    const set = (patch: Partial<CategoryFormData>) =>
        onChange({ ...categoryData, ...patch });

    return (
        <>
            <div className="grid gap-2 sm:col-span-2">
                <label className="text-sm font-medium">{nameLabel}</label>
                <input
                    value={categoryData.nazwa}
                    onChange={(e) => set({ nazwa: e.target.value })}
                    className={formCls}
                    placeholder="Np. Szampon wygładzający"
                />
            </div>
            <div className="grid gap-2 sm:col-span-2">
                <label className="text-sm font-medium">Kategoria główna</label>
                <select
                    value={categoryData.kategoria}
                    onChange={(e) =>
                        set({
                            kategoria: e.target.value,
                            nowa_nazwa:
                                e.target.value === "dodaj-nowa" ? "" : categoryData.nowa_nazwa,
                        })
                    }
                    className={formCls}>
                    <option value="">Wybierz kategorię</option>
                    {mainCategories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                    <option value="dodaj-nowa">Dodaj nową kategorię główną</option>
                </select>
                {categoryData.kategoria === "dodaj-nowa" && (
                    <input
                        value={categoryData.nowa_nazwa || ""}
                        onChange={(e) => set({ nowa_nazwa: e.target.value })}
                        className={formCls}
                        placeholder="Np. Kosmetyki"
                    />
                )}
                {categoryData.kategoria &&
                    categoryData.kategoria !== "dodaj-nowa" &&
                    existingCategories[categoryData.kategoria] && (
                        <div className="mt-2 rounded-lg border border-[var(--border-light)] bg-[var(--background)]/30 p-3">
                            <p className="text-xs font-medium text-muted-foreground">
                                Istniejące podkategorie w tej kategorii:
                            </p>
                            <ul className="mt-1 flex flex-wrap gap-2">
                                {existingCategories[categoryData.kategoria].map(
                                    (c) => (
                                        <li
                                            key={c._id ?? c.slug}
                                            className="text-sm text-[var(--text-dark)]">
                                            {c.nazwa}
                                        </li>
                                    ),
                                )}
                            </ul>
                        </div>
                    )}
            </div>
            <div className="grid gap-2 sm:col-span-2">
                <label className="text-sm font-medium">Typ kategorii</label>
                <select
                    value={categoryData.type}
                    onChange={(e) =>
                        set({ type: e.target.value as Categories["type"] })
                    }
                    className={formCls}>
                    <option value="product">Produkt</option>
                    <option value="course">Kurs</option>
                </select>
            </div>
        </>
    );
}
