"use client";

import { useState, useEffect } from "react";
import {
    Products,
    Categories,
    Producents,
    Media,
    Warianty,
} from "@/lib/models/Products";
import Image from "next/image";
import { X, Save, Trash2, Plus, Minus } from "lucide-react";

interface ProductEditModalProps {
    product: Products;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (product: Products) => void;
    onDelete: (productSlug: string) => void;
}

export default function ProductEditModal({
    product,
    isOpen,
    onClose,
    onUpdate,
    onDelete,
}: ProductEditModalProps) {
    const [editedProduct, setEditedProduct] = useState<Products>(product);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setEditedProduct(product);
    }, [product]);

    if (!isOpen) return null;

    // Helper functions
    const getCategories = (): Categories[] => {
        if (!editedProduct.kategoria) return [];
        if (Array.isArray(editedProduct.kategoria)) {
            return editedProduct.kategoria.filter(
                (cat): cat is Categories =>
                    typeof cat === "object" &&
                    cat !== null &&
                    "nazwa" in cat &&
                    "slug" in cat
            ) as Categories[];
        }
        return [];
    };

    const getProducent = (): Producents | null => {
        if (!editedProduct.producent) return null;
        if (typeof editedProduct.producent === "string") {
            return { nazwa: editedProduct.producent };
        }
        if (
            typeof editedProduct.producent === "object" &&
            "nazwa" in editedProduct.producent
        ) {
            return editedProduct.producent as Producents;
        }
        return null;
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { updateProduct } = await import("@/lib/utils");
            const result = await updateProduct(editedProduct);
            if (result.status === 0) {
                onUpdate(editedProduct);
            } else {
                alert(
                    "Błąd podczas zapisywania produktu: " +
                        (result.error || "Nieznany błąd")
                );
            }
        } catch (error) {
            console.error("Błąd podczas zapisywania produktu:", error);
            alert("Błąd podczas zapisywania produktu. Sprawdź konsolę.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Czy na pewno chcesz usunąć ten produkt?")) {
            return;
        }
        try {
            const { deleteProduct } = await import("@/lib/utils");
            const result = await deleteProduct(product.slug);
            if (result.status === 0) {
                onDelete(product.slug);
            } else {
                alert(
                    "Błąd podczas usuwania produktu: " +
                        (result.error || "Nieznany błąd")
                );
            }
        } catch (error) {
            console.error("Błąd podczas usuwania produktu:", error);
            alert("Błąd podczas usuwania produktu. Sprawdź konsolę.");
        }
    };

    const updateField = <K extends keyof Products>(
        field: K,
        value: Products[K]
    ) => {
        setEditedProduct((prev) => ({ ...prev, [field]: value }));
    };

    const updateCategory = (
        index: number,
        field: keyof Categories,
        value: string
    ) => {
        const categories = getCategories();
        const updated = [...categories];
        if (updated[index]) {
            updated[index] = { ...updated[index], [field]: value };
            updateField("kategoria", updated);
        }
    };

    const addCategory = () => {
        const categories = getCategories();
        updateField("kategoria", [
            ...categories,
            { nazwa: "", slug: "", image: "" },
        ]);
    };

    const removeCategory = (index: number) => {
        const categories = getCategories();
        updateField(
            "kategoria",
            categories.filter((_, i) => i !== index)
        );
    };

    const addMedia = () => {
        const media = editedProduct.media || [];
        updateField("media", [
            ...media,
            { nazwa: "", slug: "", typ: "image", alt: "", path: "" },
        ]);
    };

    const updateMedia = (index: number, field: keyof Media, value: string) => {
        const media = [...(editedProduct.media || [])];
        if (media[index]) {
            media[index] = { ...media[index], [field]: value };
            updateField("media", media);
        }
    };

    const removeMedia = (index: number) => {
        const media = editedProduct.media || [];
        updateField(
            "media",
            media.filter((_, i) => i !== index)
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold">Edytuj produkt</h2>
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Nazwa produktu *
                                </label>
                                <input
                                    type="text"
                                    value={editedProduct.nazwa || ""}
                                    onChange={(e) =>
                                        updateField("nazwa", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Slug *
                                </label>
                                <input
                                    type="text"
                                    value={editedProduct.slug || ""}
                                    onChange={(e) =>
                                        updateField("slug", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Cena (zł) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editedProduct.cena || 0}
                                    onChange={(e) =>
                                        updateField(
                                            "cena",
                                            parseFloat(e.target.value) || 0
                                        )
                                    }
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Ilość *
                                </label>
                                <input
                                    type="number"
                                    value={editedProduct.ilosc || 0}
                                    onChange={(e) =>
                                        updateField(
                                            "ilosc",
                                            parseInt(e.target.value) || 0
                                        )
                                    }
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Dostępność *
                                </label>
                                <select
                                    value={editedProduct.dostepnosc || ""}
                                    onChange={(e) =>
                                        updateField(
                                            "dostepnosc",
                                            e.target.value
                                        )
                                    }
                                    className="w-full px-3 py-2 border rounded-md">
                                    <option value="dostępny">Dostępny</option>
                                    <option value="niedostępny">
                                        Niedostępny
                                    </option>
                                    <option value="na zamówienie">
                                        Na zamówienie
                                    </option>
                                    <option value="wyprzedany">
                                        Wyprzedany
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Czas wysyłki (dni) *
                                </label>
                                <input
                                    type="number"
                                    value={editedProduct.czas_wysylki || 1}
                                    onChange={(e) =>
                                        updateField(
                                            "czas_wysylki",
                                            parseInt(e.target.value) || 1
                                        )
                                    }
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Kod produkcyjny *
                                </label>
                                <input
                                    type="text"
                                    value={editedProduct.kod_produkcyjny || ""}
                                    onChange={(e) =>
                                        updateField(
                                            "kod_produkcyjny",
                                            e.target.value
                                        )
                                    }
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Ocena
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="5"
                                    value={editedProduct.ocena || 0}
                                    onChange={(e) =>
                                        updateField(
                                            "ocena",
                                            parseFloat(e.target.value) || 0
                                        )
                                    }
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Kod EAN
                                </label>
                                <input
                                    type="text"
                                    value={editedProduct.kod_ean || ""}
                                    onChange={(e) =>
                                        updateField("kod_ean", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    SKU
                                </label>
                                <input
                                    type="text"
                                    value={editedProduct.sku || ""}
                                    onChange={(e) =>
                                        updateField("sku", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={editedProduct.aktywne !== false}
                                    onChange={(e) =>
                                        updateField("aktywne", e.target.checked)
                                    }
                                    className="w-4 h-4"
                                />
                                <label className="text-sm font-medium">
                                    Produkt aktywny
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Opis *
                        </label>
                        <textarea
                            value={editedProduct.opis || ""}
                            onChange={(e) =>
                                updateField("opis", e.target.value)
                            }
                            rows={4}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>

                    {/* Categories - Array */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">Kategorie</h3>
                            <button
                                onClick={addCategory}
                                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-1">
                                <Plus className="h-4 w-4" />
                                Dodaj kategorię
                            </button>
                        </div>
                        <div className="space-y-2">
                            {getCategories().map((cat, index) => (
                                <div
                                    key={index}
                                    className="flex gap-2 items-start p-3 border rounded-md">
                                    <div className="flex-1 grid grid-cols-3 gap-2">
                                        <input
                                            type="text"
                                            placeholder="Nazwa kategorii"
                                            value={cat.nazwa || ""}
                                            onChange={(e) =>
                                                updateCategory(
                                                    index,
                                                    "nazwa",
                                                    e.target.value
                                                )
                                            }
                                            className="px-3 py-2 border rounded-md"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Slug kategorii"
                                            value={cat.slug || ""}
                                            onChange={(e) =>
                                                updateCategory(
                                                    index,
                                                    "slug",
                                                    e.target.value
                                                )
                                            }
                                            className="px-3 py-2 border rounded-md"
                                        />
                                        <input
                                            type="text"
                                            placeholder="URL obrazka"
                                            value={cat.image || ""}
                                            onChange={(e) =>
                                                updateCategory(
                                                    index,
                                                    "image",
                                                    e.target.value
                                                )
                                            }
                                            className="px-3 py-2 border rounded-md"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeCategory(index)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                                        <Minus className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            {getCategories().length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Brak kategorii. Kliknij {'"'}Dodaj kategorię
                                    {'"'} aby dodać.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Producer */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">
                            Producent
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Nazwa producenta"
                                value={getProducent()?.nazwa || ""}
                                onChange={(e) =>
                                    updateField("producent", {
                                        nazwa: e.target.value,
                                    } as Producents)
                                }
                                className="px-3 py-2 border rounded-md"
                            />
                            <input
                                type="text"
                                placeholder="Slug producenta (opcjonalnie)"
                                value={getProducent()?.slug || ""}
                                onChange={(e) =>
                                    updateField("producent", {
                                        ...getProducent(),
                                        nazwa: getProducent()?.nazwa || "",
                                        slug: e.target.value,
                                    } as Producents)
                                }
                                className="px-3 py-2 border rounded-md"
                            />
                        </div>
                    </div>

                    {/* Media - Array */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">Media</h3>
                            <button
                                onClick={addMedia}
                                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-1">
                                <Plus className="h-4 w-4" />
                                Dodaj media
                            </button>
                        </div>
                        <div className="space-y-2">
                            {(editedProduct.media || []).map((media, index) => (
                                <div
                                    key={index}
                                    className="flex gap-2 items-start p-3 border rounded-md">
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="Ścieżka do pliku"
                                            value={media.path || ""}
                                            onChange={(e) =>
                                                updateMedia(
                                                    index,
                                                    "path",
                                                    e.target.value
                                                )
                                            }
                                            className="px-3 py-2 border rounded-md"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Alt text"
                                            value={media.alt || ""}
                                            onChange={(e) =>
                                                updateMedia(
                                                    index,
                                                    "alt",
                                                    e.target.value
                                                )
                                            }
                                            className="px-3 py-2 border rounded-md"
                                        />
                                        <select
                                            value={media.typ || "image"}
                                            onChange={(e) =>
                                                updateMedia(
                                                    index,
                                                    "typ",
                                                    e.target.value
                                                )
                                            }
                                            className="px-3 py-2 border rounded-md">
                                            <option value="image">Obraz</option>
                                            <option value="video">Video</option>
                                            <option value="pdf">PDF</option>
                                            <option value="other">Inne</option>
                                        </select>
                                        {media.path &&
                                            media.typ === "image" && (
                                                <div className="relative w-full h-24 border rounded-md overflow-hidden">
                                                    <Image
                                                        src={media.path}
                                                        alt={media.alt || ""}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}
                                    </div>
                                    <button
                                        onClick={() => removeMedia(index)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                                        <Minus className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            {(editedProduct.media || []).length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Brak mediów. Kliknij {'"'}Dodaj media{'"'}{" "}
                                    aby dodać.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t bg-muted/50">
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Usuń produkt
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border rounded-md hover:bg-accent">
                            Anuluj
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50">
                            <Save className="h-4 w-4" />
                            {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
