"use client";

import { useState, useEffect } from "react";
import { Categories, Promos, Media } from "@/lib/types/shared";
import { Products, Producents, Warianty } from "@/lib/types/productTypes";
import Image from "next/image";
import { X, Save, Trash2, Plus, Minus } from "lucide-react";
import { makeSlugKeys, parseSlugName } from "@/lib/utils_admin";

// Helper do generowania slug
function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

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

    // Kategorie i producent z API
    const [categories, setCategories] = useState<Record<string, Categories[]>>(
        {},
    );
    const [categoriesSlug, setCategoriesSlug] = useState<string[]>([]);
    const [producents, setProducents] = useState<Producents[]>([]);

    // Wybrane kategorie (główna + podrzędne)
    const [selectedMainCategory, setSelectedMainCategory] =
        useState<string>("");
    const [selectedSubCategories, setSelectedSubCategories] = useState<
        string[]
    >([]);
    const [selectedProducent, setSelectedProducent] = useState<string>("");

    useEffect(() => {
        // Konwertuj wartości 0 na undefined dla pól numerycznych
        const normalizedProduct = {
            ...product,
            cena: product.cena === 0 ? undefined : product.cena,
            cena_skupu: product.cena_skupu === 0 ? undefined : product.cena_skupu,
            ilosc: product.ilosc === 0 ? undefined : product.ilosc,
            czas_wysylki: product.czas_wysylki === 0 ? undefined : product.czas_wysylki,
            ocena: product.ocena === 0 ? undefined : product.ocena,
        };
        setEditedProduct(normalizedProduct);
    }, [product]);

    // Auto-generuj slug z nazwy
    useEffect(() => {
        if (editedProduct.nazwa && !editedProduct.slug) {
            setEditedProduct((prev) => ({
                ...prev,
                slug: generateSlug(prev.nazwa),
            }));
        }
    }, [editedProduct.nazwa]);

    // Pobierz kategorie
    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await fetch("/admin/api/v1/category", {
                    method: "GET",
                    credentials: "include",
                });
                const data = await response.json();
                if (data.status === 0 && data.categories) {
                    setCategories(data.categories);
                    setCategoriesSlug(makeSlugKeys(data.categories));

                    // Ustaw wybrane kategorie na podstawie produktu
                    const productCategories = getCategories();
                    if (productCategories.length > 0) {
                        const firstCat = productCategories[0];
                        const mainSlug = firstCat.slug;
                        setSelectedMainCategory(mainSlug);
                        setSelectedSubCategories(
                            productCategories
                                .map((cat) => cat._id || "")
                                .filter((id) => id),
                        );
                    }
                }
            } catch (error) {
                console.error("Błąd podczas pobierania kategorii:", error);
            }
        }
        fetchCategories();
    }, []);

    // Pobierz producentów
    useEffect(() => {
        async function fetchProducents() {
            try {
                const response = await fetch("/admin/api/v1/producents", {
                    method: "GET",
                    credentials: "include",
                });
                const data = await response.json();
                if (data.status === 0 && data.producents) {
                    setProducents(data.producents);

                    // Ustaw wybranego producenta
                    const producent = getProducent();
                    if (producent && producent.slug) {
                        setSelectedProducent(producent.slug);
                    }
                }
            } catch (error) {
                console.error("Błąd podczas pobierania producentów:", error);
            }
        }
        fetchProducents();
    }, []);

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
                    "slug" in cat,
            ) as Categories[];
        }
        return [];
    };

    const getProducent = (): Producents | null => {
        if (!editedProduct.producent) return null;
        return editedProduct.producent as Producents;
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Upewnij się, że slug jest wygenerowany
            const productToSave = {
                ...editedProduct,
                slug: editedProduct.slug || generateSlug(editedProduct.nazwa),
            };

            const { updateProduct } = await import("@/lib/utils");
            const result = await updateProduct(productToSave);
            if (result.status === 0) {
                onUpdate(productToSave);
            } else {
                alert(
                    "Błąd podczas zapisywania produktu: " +
                        (result.error || "Nieznany błąd"),
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
                        (result.error || "Nieznany błąd"),
                );
            }
        } catch (error) {
            console.error("Błąd podczas usuwania produktu:", error);
            alert("Błąd podczas usuwania produktu. Sprawdź konsolę.");
        }
    };

    const updateField = <K extends keyof Products>(
        field: K,
        value: Products[K],
    ) => {
        setEditedProduct((prev) => ({ ...prev, [field]: value }));
    };

    // Obsługa wyboru głównej kategorii
    const handleMainCategoryChange = (mainSlug: string) => {
        setSelectedMainCategory(mainSlug);
        setSelectedSubCategories([]);
        // Zaktualizuj kategorie produktu
        if (categories[mainSlug]) {
            updateField("kategoria", categories[mainSlug]);
        }
    };

    // Obsługa wyboru podkategorii
    const handleSubCategoryToggle = (subCategoryId: string) => {
        setSelectedSubCategories((prev) => {
            const newSelected = prev.includes(subCategoryId)
                ? prev.filter((id) => id !== subCategoryId)
                : [...prev, subCategoryId];

            // Zaktualizuj kategorie produktu
            if (selectedMainCategory && categories[selectedMainCategory]) {
                const selectedCats = categories[selectedMainCategory].filter(
                    (cat) => newSelected.includes(cat._id || ""),
                );
                updateField("kategoria", selectedCats);
            }

            return newSelected;
        });
    };

    // Obsługa zmiany producenta
    const handleProducentChange = (producentId: string) => {
        setSelectedProducent(producentId);
        const producentData = producents.find((p) => p.slug === producentId);
        if (producentData) {
            updateField("producent", producentData.slug || producentData);
        }
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
            media.filter((_, i) => i !== index),
        );
    };

    // Obsługa specyfikacji
    const getSpecyfikacja = () => {
        return editedProduct.specyfikacja || [];
    };

    const addSpecyfikacja = () => {
        const spec = getSpecyfikacja();
        updateField("specyfikacja", [...spec, { key: "", value: "" }]);
    };

    const updateSpecyfikacja = (
        index: number,
        field: "key" | "value",
        value: string,
    ) => {
        const spec = getSpecyfikacja();
        const updated = [...spec];
        updated[index] = { ...updated[index], [field]: value };
        updateField("specyfikacja", updated);
    };

    const removeSpecyfikacja = (index: number) => {
        const spec = getSpecyfikacja();
        updateField(
            "specyfikacja",
            spec.filter((_, i) => i !== index),
        );
    };

    // Obsługa wariantów
    const getWarianty = (): Warianty[] => {
        return editedProduct.wariant || [];
    };

    const addWariant = () => {
        const warianty = getWarianty();
        updateField("wariant", [
            ...warianty,
            {
                nazwa: "",
                slug: "",
                typ: "kolor",
                nadpisuje_cene: false,
                inna_cena_skupu: false,
            },
        ]);
    };

    const updateWariant = (
        index: number,
        field: keyof Warianty,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: any,
    ) => {
        const warianty = getWarianty();
        const updated = [...warianty];
        updated[index] = { ...updated[index], [field]: value };
        // Auto-generuj slug z nazwy wariantu
        if (field === "nazwa" && value) {
            updated[index].slug = generateSlug(value);
        }
        updateField("wariant", updated);
    };

    const removeWariant = (index: number) => {
        const warianty = getWarianty();
        updateField(
            "wariant",
            warianty.filter((_, i) => i !== index),
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
                                    Slug (auto-generowany)
                                </label>
                                <input
                                    type="text"
                                    value={editedProduct.slug || ""}
                                    onChange={(e) =>
                                        updateField("slug", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border rounded-md"
                                    readOnly
                                />
                                <span className="text-xs text-muted-foreground">
                                    Slug jest automatycznie generowany z nazwy
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Cena (bez VAT) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editedProduct.cena && editedProduct.cena !== 0 ? editedProduct.cena : ""}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === "" || val === null || val === undefined) {
                                            updateField("cena", undefined);
                                        } else {
                                            const numVal = parseFloat(val);
                                            if (!isNaN(numVal)) {
                                                updateField("cena", numVal);
                                            }
                                        }
                                    }}
                                    onFocus={(e) => {
                                        if (e.target.value === "0" || e.target.value === "") {
                                            e.target.select();
                                        }
                                    }}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Cena skupu (analityka) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editedProduct.cena_skupu === 0 || editedProduct.cena_skupu === undefined || editedProduct.cena_skupu === null ? "" : editedProduct.cena_skupu}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        updateField(
                                            "cena_skupu",
                                            val === "" ? undefined : parseFloat(val) || undefined,
                                        );
                                    }}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Ilość *
                                </label>
                                <input
                                    type="number"
                                    value={editedProduct.ilosc === 0 || editedProduct.ilosc === undefined || editedProduct.ilosc === null ? "" : editedProduct.ilosc}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        updateField(
                                            "ilosc",
                                            val === "" ? undefined : parseInt(val) || undefined,
                                        );
                                    }}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Dostępność *
                                </label>
                                <select
                                    value={editedProduct.dostepnosc || "duza"}
                                    onChange={(e) =>
                                        updateField(
                                            "dostepnosc",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full px-3 py-2 border rounded-md">
                                    <option value="duza">Duża</option>
                                    <option value="ograniczona">
                                        Ograniczona
                                    </option>
                                    <option value="mała">Mała</option>
                                    <option value="niedostępne">
                                        Niedostępne
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Czas wysyłki (dni) *
                                </label>
                                <input
                                    type="number"
                                    value={editedProduct.czas_wysylki === 0 || editedProduct.czas_wysylki === undefined || editedProduct.czas_wysylki === null ? "" : editedProduct.czas_wysylki}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        updateField(
                                            "czas_wysylki",
                                            val === "" ? undefined : parseInt(val) || undefined,
                                        );
                                    }}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="1"
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
                                            e.target.value,
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
                                    value={editedProduct.ocena === 0 || editedProduct.ocena === undefined || editedProduct.ocena === null ? "" : editedProduct.ocena}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        updateField(
                                            "ocena",
                                            val === "" ? undefined : parseFloat(val) || undefined,
                                        );
                                    }}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="0.0"
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

                    {/* Categories - Select */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">
                            Kategorie *
                        </h3>
                        <div className="space-y-2">
                            <select
                                value={selectedMainCategory}
                                onChange={(e) =>
                                    handleMainCategoryChange(e.target.value)
                                }
                                className="w-full px-3 py-2 border rounded-md">
                                <option value="">
                                    Wybierz główną kategorię
                                </option>
                                {categoriesSlug.map((slug) => (
                                    <option key={slug} value={slug}>
                                        {parseSlugName(slug)}
                                    </option>
                                ))}
                            </select>
                            {selectedMainCategory &&
                                categories[selectedMainCategory] && (
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">
                                            Wybierz podkategorie (wiele):
                                        </label>
                                        {categories[selectedMainCategory].map(
                                            (cat) => (
                                                <label
                                                    key={cat._id || cat.nazwa}
                                                    className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-accent">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSubCategories.includes(
                                                            cat._id || "",
                                                        )}
                                                        onChange={() =>
                                                            handleSubCategoryToggle(
                                                                cat._id || "",
                                                            )
                                                        }
                                                        className="w-4 h-4"
                                                    />
                                                    <span className="text-sm">
                                                        {cat.nazwa}
                                                    </span>
                                                </label>
                                            ),
                                        )}
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* Producer - Select */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">
                            Producent *
                        </h3>
                        <select
                            value={selectedProducent}
                            onChange={(e) =>
                                handleProducentChange(e.target.value)
                            }
                            className="w-full px-3 py-2 border rounded-md">
                            <option value="">Wybierz producenta</option>
                            {producents.map((prod) => (
                                <option key={prod.nazwa} value={prod.slug}>
                                    {prod.nazwa}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Specyfikacja */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">
                                Specyfikacja
                            </h3>
                            <button
                                type="button"
                                onClick={addSpecyfikacja}
                                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-1">
                                <Plus className="h-4 w-4" />
                                Dodaj
                            </button>
                        </div>
                        <div className="space-y-2">
                            {getSpecyfikacja().map((spec, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Klucz"
                                        value={spec.key}
                                        onChange={(e) =>
                                            updateSpecyfikacja(
                                                index,
                                                "key",
                                                e.target.value,
                                            )
                                        }
                                        className="flex-1 px-3 py-2 border rounded-md"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Wartość"
                                        value={spec.value}
                                        onChange={(e) =>
                                            updateSpecyfikacja(
                                                index,
                                                "value",
                                                e.target.value,
                                            )
                                        }
                                        className="flex-1 px-3 py-2 border rounded-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeSpecyfikacja(index)
                                        }
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                                        <Minus className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Warianty */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">Warianty</h3>
                            <button
                                type="button"
                                onClick={addWariant}
                                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-1">
                                <Plus className="h-4 w-4" />
                                Dodaj wariant
                            </button>
                        </div>
                        <div className="space-y-4">
                            {getWarianty().map((wariant, index) => (
                                <div
                                    key={index}
                                    className="p-4 border rounded-md space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs font-medium">
                                                Nazwa wariantu *
                                            </label>
                                            <input
                                                type="text"
                                                value={wariant.nazwa}
                                                onChange={(e) =>
                                                    updateWariant(
                                                        index,
                                                        "nazwa",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-3 py-2 border rounded-md text-sm"
                                                placeholder="Np. Czerwony"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium">
                                                Typ *
                                            </label>
                                            <select
                                                value={wariant.typ}
                                                onChange={(e) =>
                                                    updateWariant(
                                                        index,
                                                        "typ",
                                                        e.target
                                                            .value as Warianty["typ"],
                                                    )
                                                }
                                                className="w-full px-3 py-2 border rounded-md text-sm">
                                                <option value="kolor">
                                                    Kolor
                                                </option>
                                                <option value="rozmiar">
                                                    Rozmiar
                                                </option>
                                                <option value="objetosc">
                                                    Objętość
                                                </option>
                                                <option value="specjalna">
                                                    Specjalna
                                                </option>
                                                <option value="hurt">
                                                    Hurt
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Pola zależne od typu */}
                                    {wariant.typ === "kolor" && (
                                        <div className="grid grid-cols-3 gap-2">
                                            <input
                                                type="text"
                                                placeholder="Nazwa koloru"
                                                value={
                                                    wariant.kolory?.name || ""
                                                }
                                                onChange={(e) =>
                                                    updateWariant(
                                                        index,
                                                        "kolory",
                                                        {
                                                            ...wariant.kolory,
                                                            name: e.target
                                                                .value,
                                                            val: e.target.value,
                                                            hex:
                                                                wariant.kolory
                                                                    ?.hex ||
                                                                null,
                                                        },
                                                    )
                                                }
                                                className="px-3 py-2 border rounded-md text-sm"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Wartość"
                                                value={
                                                    wariant.kolory?.val || ""
                                                }
                                                onChange={(e) =>
                                                    updateWariant(
                                                        index,
                                                        "kolory",
                                                        {
                                                            ...wariant.kolory,
                                                            name:
                                                                wariant.kolory
                                                                    ?.name ||
                                                                "",
                                                            val: e.target.value,
                                                            hex:
                                                                wariant.kolory
                                                                    ?.hex ||
                                                                null,
                                                        },
                                                    )
                                                }
                                                className="px-3 py-2 border rounded-md text-sm"
                                            />
                                            <input
                                                type="color"
                                                value={
                                                    wariant.kolory?.hex ||
                                                    "#000000"
                                                }
                                                onChange={(e) =>
                                                    updateWariant(
                                                        index,
                                                        "kolory",
                                                        {
                                                            ...wariant.kolory,
                                                            name:
                                                                wariant.kolory
                                                                    ?.name ||
                                                                "",
                                                            val:
                                                                wariant.kolory
                                                                    ?.val || "",
                                                            hex: e.target.value,
                                                        },
                                                    )
                                                }
                                                className="rounded-md border h-10"
                                            />
                                        </div>
                                    )}
                                    {wariant.typ === "rozmiar" && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                placeholder="Nazwa rozmiaru"
                                                value={
                                                    wariant.rozmiary?.name || ""
                                                }
                                                onChange={(e) =>
                                                    updateWariant(
                                                        index,
                                                        "rozmiary",
                                                        {
                                                            ...wariant.rozmiary,
                                                            name: e.target
                                                                .value,
                                                            val: e.target.value,
                                                            hex: null,
                                                        },
                                                    )
                                                }
                                                className="px-3 py-2 border rounded-md text-sm"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Wartość"
                                                value={
                                                    wariant.rozmiary?.val || ""
                                                }
                                                onChange={(e) =>
                                                    updateWariant(
                                                        index,
                                                        "rozmiary",
                                                        {
                                                            ...wariant.rozmiary,
                                                            name:
                                                                wariant.rozmiary
                                                                    ?.name ||
                                                                "",
                                                            val: e.target.value,
                                                            hex: null,
                                                        },
                                                    )
                                                }
                                                className="px-3 py-2 border rounded-md text-sm"
                                            />
                                        </div>
                                    )}
                                    {wariant.typ === "objetosc" && (
                                        <div>
                                            <input
                                                type="number"
                                                placeholder="Objętość (ml)"
                                                value={wariant.objetosc === 0 || wariant.objetosc === undefined || wariant.objetosc === null ? "" : wariant.objetosc}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    updateWariant(
                                                        index,
                                                        "objetosc",
                                                        val === "" ? undefined : parseFloat(val) || undefined,
                                                    );
                                                }}
                                                className="w-full px-3 py-2 border rounded-md text-sm"
                                            />
                                        </div>
                                    )}

                                    {/* Nadpisuje cenę */}
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={
                                                wariant.nadpisuje_cene || false
                                            }
                                            onChange={(e) =>
                                                updateWariant(
                                                    index,
                                                    "nadpisuje_cene",
                                                    e.target.checked,
                                                )
                                            }
                                            className="w-4 h-4"
                                        />
                                        <label className="text-xs">
                                            Nadpisuje cenę
                                        </label>
                                        {wariant.nadpisuje_cene && (
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="Nowa cena"
                                                value={wariant.nowa_cena === 0 || wariant.nowa_cena === undefined || wariant.nowa_cena === null ? "" : wariant.nowa_cena}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    updateWariant(
                                                        index,
                                                        "nowa_cena",
                                                        val === "" ? undefined : parseFloat(val) || undefined,
                                                    );
                                                }}
                                                className="flex-1 px-3 py-2 border rounded-md text-sm"
                                            />
                                        )}
                                    </div>

                                    {/* Inna cena skupu */}
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={
                                                wariant.inna_cena_skupu || false
                                            }
                                            onChange={(e) =>
                                                updateWariant(
                                                    index,
                                                    "inna_cena_skupu",
                                                    e.target.checked,
                                                )
                                            }
                                            className="w-4 h-4"
                                        />
                                        <label className="text-xs">
                                            Inna cena skupu (analityka)
                                        </label>
                                        {wariant.inna_cena_skupu && (
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="Cena skupu"
                                                value={wariant.cena_skupu === 0 || wariant.cena_skupu === undefined || wariant.cena_skupu === null ? "" : wariant.cena_skupu}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    updateWariant(
                                                        index,
                                                        "cena_skupu",
                                                        val === "" ? undefined : parseFloat(val) || undefined,
                                                    );
                                                }}
                                                className="flex-1 px-3 py-2 border rounded-md text-sm"
                                            />
                                        )}
                                    </div>

                                    {/* Permisje */}
                                    {(wariant.typ === "hurt" ||
                                        wariant.typ === "specjalna") && (
                                        <div>
                                            <label className="text-xs font-medium">
                                                Permisje (opcjonalnie)
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="Kod permisji"
                                                value={wariant.permisje || ""}
                                                onChange={(e) =>
                                                    updateWariant(
                                                        index,
                                                        "permisje",
                                                        parseInt(
                                                            e.target.value,
                                                        ) || undefined,
                                                    )
                                                }
                                                className="w-full px-3 py-2 border rounded-md text-sm"
                                            />
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => removeWariant(index)}
                                        className="w-full px-3 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50">
                                        Usuń wariant
                                    </button>
                                </div>
                            ))}
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
                                                    e.target.value,
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
                                                    e.target.value,
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
                                                    e.target.value,
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
