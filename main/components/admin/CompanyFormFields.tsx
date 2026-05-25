"use client";

import { Firmy } from "@/lib/types/coursesTypes";
import { Users } from "@/lib/types/userTypes";
import { X } from "lucide-react";
import { adminInputClass } from "./adminFormStyles";

interface CompanyBasicFieldsProps {
    firm: Firmy;
    onChange: (firm: Firmy) => void;
    slugHint?: string;
}

export function CompanyBasicFields({
    firm,
    onChange,
    slugHint,
}: CompanyBasicFieldsProps) {
    const set = <K extends keyof Firmy>(key: K, value: Firmy[K]) =>
        onChange({ ...firm, [key]: value });

    return (
        <>
            <div className="grid gap-2 sm:col-span-2">
                <label className="text-sm font-medium">Nazwa firmy *</label>
                <input
                    type="text"
                    value={firm.nazwa}
                    onChange={(e) => set("nazwa", e.target.value)}
                    required
                    className={adminInputClass}
                    placeholder="Np. Akademia Fryzjerstwa"
                />
                {slugHint !== undefined && (
                    <span className="text-xs text-muted-foreground">
                        Slug (auto-generowany): {slugHint || "(wpisz nazwę)"}
                    </span>
                )}
            </div>
            <div className="grid gap-2 sm:col-span-2">
                <label className="text-sm font-medium">Opis</label>
                <textarea
                    rows={4}
                    value={firm.opis || ""}
                    onChange={(e) => set("opis", e.target.value)}
                    className={`${adminInputClass} resize-none`}
                    placeholder="Opis firmy..."
                />
            </div>
            <div className="grid gap-2 sm:col-span-2">
                <label className="text-sm font-medium">Strona internetowa</label>
                <input
                    type="url"
                    value={firm.strona_internetowa || ""}
                    onChange={(e) =>
                        set("strona_internetowa", e.target.value || null)
                    }
                    className={adminInputClass}
                    placeholder="https://example.com"
                />
            </div>
            <div className="grid gap-2 sm:col-span-2">
                <label className="text-sm font-medium">Logo — ścieżka</label>
                <input
                    type="text"
                    value={firm.logo?.path || ""}
                    onChange={(e) =>
                        set("logo", {
                            ...(firm.logo ?? {
                                nazwa: "",
                                slug: "",
                                typ: "image",
                                alt: "",
                                path: "",
                            }),
                            path: e.target.value,
                        })
                    }
                    className={adminInputClass}
                    placeholder="/images/logo.png"
                />
            </div>
            <div className="grid gap-2 sm:col-span-2">
                <label className="text-sm font-medium">Logo — alt</label>
                <input
                    type="text"
                    value={firm.logo?.alt || ""}
                    onChange={(e) =>
                        set("logo", {
                            ...(firm.logo ?? {
                                nazwa: "",
                                slug: "",
                                typ: "image",
                                alt: "",
                                path: "",
                            }),
                            alt: e.target.value,
                        })
                    }
                    className={adminInputClass}
                    placeholder="Alt text"
                />
            </div>
        </>
    );
}

interface CompanyInstructorsFieldsProps {
    firm: Firmy;
    onChange: (firm: Firmy) => void;
    users: Users[];
    usersLoading: boolean;
    employeeQuery: string;
    onEmployeeQueryChange: (q: string) => void;
    dropdownOpen: boolean;
    onDropdownOpenChange: (open: boolean) => void;
}

export function CompanyInstructorsFields({
    firm,
    onChange,
    users,
    usersLoading,
    employeeQuery,
    onEmployeeQueryChange,
    dropdownOpen,
    onDropdownOpenChange,
}: CompanyInstructorsFieldsProps) {
    const selectedIds = (firm.instruktorzy as string[]) || [];
    const employeeFiltered = users.filter((u) => {
        if (!u._id || selectedIds.includes(u._id)) return false;
        const q = employeeQuery.trim().toLowerCase();
        if (!q) return true;
        const full = `${(u.imie || "").toLowerCase()} ${(u.nazwisko || "").toLowerCase()} ${(u.email || "").toLowerCase()}`;
        return full.includes(q);
    });

    const set = <K extends keyof Firmy>(key: K, value: Firmy[K]) =>
        onChange({ ...firm, [key]: value });

    return (
        <div className="grid gap-2 sm:col-span-2 space-y-3">
            <label className="text-sm font-medium">Pracownicy (instruktorzy)</label>
            {!usersLoading && (
                <div className="relative">
                    <input
                        type="text"
                        value={employeeQuery}
                        onChange={(e) => {
                            onEmployeeQueryChange(e.target.value);
                            onDropdownOpenChange(true);
                        }}
                        onFocus={() => onDropdownOpenChange(true)}
                        onBlur={() =>
                            setTimeout(() => onDropdownOpenChange(false), 150)
                        }
                        placeholder="Wpisz imię, nazwisko lub email..."
                        className={adminInputClass}
                        autoComplete="off"
                    />
                    {dropdownOpen && (
                        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-background py-1 shadow-lg">
                            {employeeFiltered.length === 0 ? (
                                <li className="px-3 py-2 text-sm text-muted-foreground">
                                    Brak pasujących użytkowników
                                </li>
                            ) : (
                                employeeFiltered.map((u) => (
                                    <li
                                        key={u._id}
                                        className="cursor-pointer px-3 py-2 text-sm hover:bg-accent"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            if (
                                                u._id &&
                                                !selectedIds.includes(u._id)
                                            ) {
                                                set("instruktorzy", [
                                                    ...selectedIds,
                                                    u._id,
                                                ]);
                                            }
                                            onEmployeeQueryChange("");
                                            onDropdownOpenChange(false);
                                        }}>
                                        {u.imie} {u.nazwisko}
                                        {u.email ? (
                                            <span className="text-muted-foreground">
                                                {" "}
                                                — {u.email}
                                            </span>
                                        ) : null}
                                    </li>
                                ))
                            )}
                        </ul>
                    )}
                </div>
            )}
            {usersLoading && (
                <span className="text-sm text-muted-foreground">
                    Ładowanie użytkowników...
                </span>
            )}
            <div className="flex flex-wrap gap-2">
                {selectedIds.map((id) => {
                    const u = users.find((x) => x._id === id);
                    const label = u ? `${u.imie} ${u.nazwisko}` : id;
                    return (
                        <span
                            key={id}
                            className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-sm">
                            {label}
                            <button
                                type="button"
                                onClick={() =>
                                    set(
                                        "instruktorzy",
                                        selectedIds.filter((x) => x !== id),
                                    )
                                }
                                className="rounded p-0.5 hover:bg-muted-foreground/20"
                                aria-label="Usuń">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    );
                })}
            </div>
            <label className="text-sm font-medium">Prowizja</label>
            <input
                type="number"
                value={firm.prowizja ?? 0}
                onChange={(e) =>
                    set("prowizja", parseFloat(e.target.value) || 0)
                }
                className={adminInputClass}
            />
            <label className="text-sm font-medium">Typ prowizji</label>
            <select
                value={firm.prowizja_typ || "procent"}
                onChange={(e) =>
                    set("prowizja_typ", e.target.value as Firmy["prowizja_typ"])
                }
                className={adminInputClass}>
                <option value="procent">Procent</option>
                <option value="kwota">Kwota</option>
            </select>
        </div>
    );
}
