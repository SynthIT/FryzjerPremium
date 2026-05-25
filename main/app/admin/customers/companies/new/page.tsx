"use client";

import { useState, useEffect } from "react";
import "@/app/globals2.css";
import { Firmy } from "@/lib/types/coursesTypes";
import { Media } from "@/lib/types/shared";
import { Users } from "@/lib/types/userTypes";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { generateSlug } from "@/lib/utils_admin";
import {
    CompanyBasicFields,
    CompanyInstructorsFields,
} from "@/components/admin/CompanyFormFields";

export default function NewCompanyPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [users, setUsers] = useState<Users[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [employeeQuery, setEmployeeQuery] = useState("");
    const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);

    const [firmPayload, setFirmPayload] = useState<Firmy>({
        nazwa: "",
        slug: "",
        logo: {
            nazwa: "",
            slug: "",
            typ: "image",
            alt: "",
            path: "",
        },
        opis: "",
        prowizja: 0,
        prowizja_typ: "procent",
        prowizja_vat: "brutto",
        strona_internetowa: null,
        instruktorzy: [],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFirmPayloadChange = (key: keyof Firmy, value: any) => {
        setFirmPayload((prev) => ({ ...prev, [key]: value }));
    };

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await fetch("/admin/api/v1/users", { credentials: "include" });
                const data = await response.json();
                if (data.users) setUsers(JSON.parse(data.users));
            } finally {
                setUsersLoading(false);
            }
        }
        fetchUsers();
    }, []);
    // Auto-generuj slug z nazwy
    useEffect(() => {
        if (firmPayload.nazwa) {
            setFirmPayload((prev) => ({
                ...prev,
                slug: generateSlug(firmPayload.nazwa),
            }));
        }
    }, [firmPayload.nazwa]);

    // Wysyłanie firmy
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Przygotuj logo
            const logo: Media = {
                nazwa: firmPayload.logo.alt || firmPayload.nazwa,
                slug: generateSlug(firmPayload.logo.alt || firmPayload.nazwa),
                typ: "image",
                alt: firmPayload.logo.alt || firmPayload.nazwa,
                path: firmPayload.logo.path,
            };
            firmPayload.logo = logo;
            const response = await fetch("/admin/api/v1/firmy", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(firmPayload),
            });

            const result = await response.json();

            if (result.status === 201 || response.ok) {
                alert("Firma została dodana pomyślnie!");
                router.push("/admin/customers/companies");
            } else {
                alert(
                    "Błąd podczas dodawania firmy: " +
                    (result.error || "Nieznany błąd"),
                );
            }
        } catch (error) {
            console.error("Błąd podczas dodawania firmy:", error);
            alert("Błąd podczas dodawania firmy. Sprawdź konsolę.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    Dodaj firmę
                </h1>
                <p className="text-sm text-muted-foreground sm:text-base">
                    Uzupełnij podstawowe informacje o firmie prowadzącej
                    szkolenia.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-8">
                {/* Sekcja 1: Podstawowe informacje*/}
                <div className="rounded-lg border p-6 space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Info className="w-4 h-4" /> Podstawowe informacje
                    </h2>
                    <CompanyBasicFields
                        firm={firmPayload}
                        onChange={setFirmPayload}
                        slugHint={firmPayload.slug}
                    />
                </div>
                <div className="rounded-lg border p-6 space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Info className="w-4 h-4" /> Pracownicy i prowizja
                    </h2>
                    <CompanyInstructorsFields
                        firm={firmPayload}
                        onChange={setFirmPayload}
                        users={users}
                        usersLoading={usersLoading}
                        employeeQuery={employeeQuery}
                        onEmployeeQueryChange={setEmployeeQuery}
                        dropdownOpen={employeeDropdownOpen}
                        onDropdownOpenChange={setEmployeeDropdownOpen}
                    />
                </div>



                {/* Submit */}
                <div className="sm:col-span-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50">
                        {isSubmitting ? "Zapisywanie..." : "Zapisz firmę"}
                    </button>
                </div>
            </form>
        </div>
    );
}
