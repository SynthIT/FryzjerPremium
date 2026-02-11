"use client";

import { useState, useEffect } from "react";
import { Firmy, Media } from "@/lib/types/coursesTypes.";
import { X, Save, Trash2 } from "lucide-react";

// Helper do generowania slug
function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

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
                alert("Błąd podczas zapisywania: " + (result.error || "Nieznany błąd"));
            }
        } catch (error) {
            console.error("Błąd podczas zapisywania firmy:", error);
            alert("Błąd podczas zapisywania firmy. Sprawdź konsolę.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Czy na pewno chcesz usunąć tę firmę? To również usunie wszystkie powiązane szkolenia!")) return;
        
        try {
            const response = await fetch(
                `/admin/api/v1/firmy?slug=${editedCompany.slug}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const result = await response.json();
            if (result.status === 0 || response.ok) {
                onDelete(editedCompany.slug || "");
            } else {
                alert("Błąd podczas usuwania firmy: " + (result.error || "Nieznany błąd"));
            }
        } catch (error) {
            console.error("Błąd podczas usuwania firmy:", error);
            alert("Błąd podczas usuwania firmy. Sprawdź konsolę.");
        }
    };

    const updateField = <K extends keyof Firmy>(
        field: K,
        value: Firmy[K]
    ) => {
        setEditedCompany((prev) => ({ ...prev, [field]: value }));
    };

    const updateLogo = (field: keyof Media, value: string) => {
        const logo = editedCompany.logo || { nazwa: "", slug: "", typ: "image", alt: "", path: "" };
        updateField("logo", { ...logo, [field]: value });
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
                        <h3 className="text-lg font-semibold">Podstawowe informacje</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">
                                    Nazwa firmy *
                                </label>
                                <input
                                    type="text"
                                    value={editedCompany.nazwa || ""}
                                    onChange={(e) => updateField("nazwa", e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">
                                    Slug
                                </label>
                                <input
                                    type="text"
                                    value={editedCompany.slug || ""}
                                    onChange={(e) => updateField("slug", e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                    readOnly
                                />
                                <span className="text-xs text-muted-foreground">
                                    Slug jest automatycznie generowany z nazwy
                                </span>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">
                                    Strona internetowa
                                </label>
                                <input
                                    type="url"
                                    value={editedCompany.strona_internetowa || ""}
                                    onChange={(e) => updateField("strona_internetowa", e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="https://example.com"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">
                                    Opis
                                </label>
                                <textarea
                                    rows={4}
                                    value={editedCompany.opis || ""}
                                    onChange={(e) => updateField("opis", e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="Opis firmy..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Logo */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Logo</h3>
                        <div className="space-y-2">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Ścieżka do logo
                                </label>
                                <input
                                    type="text"
                                    value={editedCompany.logo?.path || ""}
                                    onChange={(e) => updateLogo("path", e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="/path/to/logo.png"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Alt text
                                </label>
                                <input
                                    type="text"
                                    value={editedCompany.logo?.alt || ""}
                                    onChange={(e) => updateLogo("alt", e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="Opis logo"
                                />
                            </div>
                        </div>
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
