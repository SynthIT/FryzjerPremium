"use client";

import { useState, useEffect } from "react";
import { Firmy } from "@/lib/types/coursesTypes";
import { X, Save, Trash2 } from "lucide-react";
import { generateSlug } from "@/lib/utils_admin";
import { CompanyBasicFields } from "@/components/admin/CompanyFormFields";

interface CompanyEditModalProps {
    company: Firmy;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (company: Firmy) => void;
    onDelete: (companySlug: string) => void;
}

export default function CompanyEditModal({
    company,
    isOpen,
    onClose,
    onUpdate,
    onDelete,
}: CompanyEditModalProps) {
    const [editedCompany, setEditedCompany] = useState<Firmy>(company);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setEditedCompany(company);
    }, [company]);

    // Auto-generuj slug z nazwy
    useEffect(() => {
        if (editedCompany.nazwa && !editedCompany.slug) {
            setEditedCompany((prev) => ({
                ...prev,
                slug: generateSlug(prev.nazwa),
            }));
        }
    }, [editedCompany.nazwa]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch("/admin/api/v1/firmy", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(editedCompany),
            });

            const result = await response.json();
            if (result.status === 0 || response.ok) {
                onUpdate(editedCompany);
            } else {
                alert(
                    "Błąd podczas zapisywania: " +
                        (result.error || "Nieznany błąd"),
                );
            }
        } catch (error) {
            console.error("Błąd podczas zapisywania firmy:", error);
            alert("Błąd podczas zapisywania firmy. Sprawdź konsolę.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (
            !confirm(
                "Czy na pewno chcesz usunąć tę firmę? To również usunie wszystkie powiązane szkolenia!",
            )
        )
            return;

        try {
            const response = await fetch(
                `/admin/api/v1/firmy?slug=${editedCompany.slug}`,
                {
                    method: "DELETE",
                    credentials: "include",
                },
            );

            const result = await response.json();
            if (result.status === 0 || response.ok) {
                onDelete(editedCompany.slug || "");
            } else {
                alert(
                    "Błąd podczas usuwania firmy: " +
                        (result.error || "Nieznany błąd"),
                );
            }
        } catch (error) {
            console.error("Błąd podczas usuwania firmy:", error);
            alert("Błąd podczas usuwania firmy. Sprawdź konsolę.");
        }
    };

    const updateField = <K extends keyof Firmy>(field: K, value: Firmy[K]) => {
        setEditedCompany((prev) => ({ ...prev, [field]: value }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold">Edytuj firmę</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-accent rounded-md transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                            Podstawowe informacje
                        </h3>
                        <CompanyBasicFields
                            firm={editedCompany}
                            onChange={setEditedCompany}
                            slugHint={editedCompany.slug}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t">
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Usuń
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm border rounded-md hover:bg-accent transition-colors">
                            Anuluj
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50">
                            <Save className="h-4 w-4" />
                            {isSaving ? "Zapisywanie..." : "Zapisz"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
