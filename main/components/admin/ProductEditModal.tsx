"use client";

import { useState, useEffect } from "react";
import { Categories, Media, Promos } from "@/lib/types/shared";
import Link from "next/link";
import { Products, Producents } from "@/lib/types/productTypes";
import Image from "next/image";
import { X, Save, Trash2, Plus, Minus, BookOpen, Camera, ListChecks, Box } from "lucide-react";
import {
    AdminFormSection,
    adminModalBodyGrid,
    adminModalOverlay,
    adminModalPanel,
    adminFormSpanFull,
} from "@/components/admin/AdminFormLayout";
import { generateSlug } from "@/lib/utils_admin";
import { CenaTyp } from "@/lib/admin/pricing";
import { useCategoryTree } from "@/components/admin/hooks/useCategoryTree";
import AdminCategoryPicker from "@/components/admin/AdminCategoryPicker";
import AdminPriceVatFields from "@/components/admin/AdminPriceVatFields";
import AdminSpecListEditor from "@/components/admin/AdminSpecListEditor";
import AdminProductShippingDims from "@/components/admin/AdminProductShippingDims";
import ProductVariantsEditor from "@/components/admin/ProductVariantsEditor";
import { uploadAdminFile } from "@/lib/admin/uploadFile";

interface ProductEditModalProps {
    product: Products;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (product: Products) => void;
    onDelete: (productId: string) => void;
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
    const [isUploading, setIsUploading] = useState(false);

    const categoryTree = useCategoryTree();
    const [cenaTyp, setCenaTyp] = useState<CenaTyp>("netto");
    const [producents, setProducents] = useState<Producents[]>([]);

    const [selectedProducent, setSelectedProducent] = useState<string>("");
    const [promos, setPromos] = useState<Promos[]>([]);
    const [selectedPromoId, setSelectedPromoId] = useState<string>("");

    useEffect(() => {
        // Konwertuj wartości 0 na undefined dla pól numerycznych
        const normalizedProduct = {
            ...product,
            cena: product.cena || 0,
            cena_skupu: product.cena_skupu || 0,
            ilosc: product.ilosc || 0,
            czas_wysylki: product.czas_wysylki || 0,
            ocena: product.ocena || 0,
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
    }, [editedProduct.nazwa, editedProduct.slug]);

    useEffect(() => {
        if (!categoryTree.categoriesSlug.length) return;
        const k = product.kategoria;
        if (!Array.isArray(k) || k.length === 0) return;
        const catList = Object.values(categoryTree.categories).flat();
        const ids = k
            .map((c) => (typeof c === "string" ? c : (c as Categories)._id ?? ""))
            .filter(Boolean);
        let main = "";
        if (typeof k[0] === "object" && k[0] !== null && "kategoria" in k[0])
            main = (k[0] as Categories).kategoria ?? "";
        else if (ids[0])
            main = catList.find((c) => (c._id ?? "") === ids[0])?.kategoria ?? "";
        categoryTree.setInitialSelection(main, ids);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- init selection once categories load
    }, [product.kategoria, categoryTree.categoriesSlug.length]);
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

                    // Ustaw wybranego producenta (_id)
                    const prod = product.producent;
                    if (prod != null) {
                        const id = typeof prod === "object" && prod !== null && "_id" in prod
                            ? (prod as Producents)._id
                            : String(prod);
                        if (id) setSelectedProducent(id);
                    }
                }
            } catch (error) {
                console.error("Błąd podczas pobierania producentów:", error);
            }
        }
        fetchProducents();
    }, [product.producent]);

    useEffect(() => {
        const p = product.promocje;
        if (p == null) setSelectedPromoId("");
        else if (typeof p === "object" && p !== null && "_id" in p)
            setSelectedPromoId(String((p as { _id: string })._id));
        else setSelectedPromoId(String(p));
    }, [product]);

    useEffect(() => {
        if (!isOpen) return;
        async function fetchPromos() {
            try {
                const res = await fetch("/admin/api/v1/promo", {
                    credentials: "include",
                });
                const data = await res.json();
                if (data.status === 0 && Array.isArray(data.promos))
                    setPromos(data.promos);
            } catch (e) {
                console.error("Błąd podczas pobierania promocji:", e);
            }
        }
        fetchPromos();
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Zapisujemy tylko _id (referencje do kolekcji)
            const kategoriaIds = categoryTree.getSelectedCategoryIds();
            const producentId = selectedProducent || (editedProduct.producent != null && typeof editedProduct.producent === "object" && editedProduct.producent !== null && "_id" in editedProduct.producent
                ? (editedProduct.producent as Producents)._id
                : typeof editedProduct.producent === "string"
                    ? editedProduct.producent
                    : "");
            const promocjeId =
                selectedPromoId === "" ? null : selectedPromoId;

            const productToSave: Products = {
                ...editedProduct,
                slug: editedProduct.slug || generateSlug(editedProduct.nazwa),
                kategoria: kategoriaIds as unknown as Products["kategoria"],
                producent: producentId as unknown as Products["producent"],
                promocje: promocjeId as unknown as Products["promocje"],
            };
            if (
                !(productToSave.szerokosc > 0) ||
                !(productToSave.wysokosc > 0) ||
                !(productToSave.dlugosc > 0) ||
                !(productToSave.waga > 0)
            ) {
                alert("Uzupełnij wymiary paczki i wagę w Specyfikacji (X, Y, Z, waga).");
                setIsSaving(false);
                return;
            }
            const { updateProduct } = await import("@/lib/utils");
            const result = await updateProduct(window.location.origin, productToSave);
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
            const result = await deleteProduct(window.location.origin, product._id!);
            if (result.status === 0) {
                onDelete(product._id!);
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

    // Obsługa zmiany producenta (zapisujemy _id)
    const handleProducentChange = (producentId: string) => {
        setSelectedProducent(producentId);
        updateField("producent", producentId as unknown as Producents);
    };

    const addMedia = () => {
        const media = editedProduct.media || [];
        updateField("media", [
            ...media,
            { nazwa: "", slug: "", typ: "image", alt: "", path: "" },
        ]);
    };

    const uploadMediaFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        if (!editedProduct.slug) {
            alert("Najpierw ustaw slug produktu (z nazwy).");
            return;
        }
        setIsUploading(true);
        try {
            const parentFolder = `products/${editedProduct.slug}`;
            const next = [...(editedProduct.media || [])];
            for (const file of Array.from(files)) {
                const path = await uploadAdminFile({ file, parent: parentFolder });
                next.unshift({
                    nazwa: file.name,
                    slug: generateSlug(file.name),
                    typ: "image",
                    alt: file.name,
                    path,
                });
            }
            updateField("media", next);
        } catch (e) {
            alert(`Błąd uploadu: ${e}`);
        } finally {
            setIsUploading(false);
        }
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

    return (
        <div className={adminModalOverlay}>
            <div className={adminModalPanel}>
                <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
                    <h2 className="text-xl font-bold sm:text-2xl">Edytuj produkt</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-accent rounded-md transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                    <div className={adminModalBodyGrid}>
                        <AdminFormSection title="Podstawowe informacje" icon={BookOpen} dense>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                <AdminPriceVatFields
                                    label="Cena *"
                                    required
                                    storedNetValue={editedProduct.cena || 0}
                                    vatPercent={editedProduct.vat ?? 23}
                                    cenaTyp={cenaTyp}
                                    onStoredNetChange={(v) => updateField("cena", v)}
                                    onCenaTypChange={setCenaTyp}
                                    variant="modal"
                                />
                                <AdminPriceVatFields
                                    label="Cena skupu (analityka) *"
                                    required
                                    storedNetValue={editedProduct.cena_skupu || 0}
                                    vatPercent={editedProduct.vat ?? 23}
                                    cenaTyp={cenaTyp}
                                    onStoredNetChange={(v) => updateField("cena_skupu", v)}
                                    onCenaTypChange={setCenaTyp}
                                    variant="modal"
                                    previewPrefix="Cena skupu z VAT"
                                />
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
                                                val === "" ? 0 : parseInt(val) || 0,
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
                                                val === "" ? 0 : parseInt(val) || 0,
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
                                                val === "" ? 0 : parseFloat(val) || 0,
                                            );
                                        }}
                                        className="w-full px-3 py-2 border rounded-md"
                                        placeholder="0.0"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium mb-1">
                                        Promocja (globalna)
                                    </label>
                                    <select
                                        value={selectedPromoId}
                                        onChange={(e) =>
                                            setSelectedPromoId(e.target.value)
                                        }
                                        className="w-full px-3 py-2 border rounded-md">
                                        <option value="">— Brak promocji —</option>
                                        {promos.map((pr) => {
                                            const id = pr._id
                                                ? String(pr._id)
                                                : "";
                                            if (!id) return null;
                                            return (
                                                <option key={id} value={id}>
                                                    {pr.nazwa}
                                                    {pr.procent != null &&
                                                        pr.procent > 0
                                                        ? ` (−${pr.procent}%)`
                                                        : ""}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        <Link
                                            href="/admin/discounts/new"
                                            className="text-[#D2B79B] hover:underline">
                                            Dodaj nową promocję
                                        </Link>
                                    </p>
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
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium mb-1">Opis *</label>
                                <textarea
                                    value={editedProduct.opis || ""}
                                    onChange={(e) => updateField("opis", e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border rounded-md text-sm"
                                />
                            </div>
                        </AdminFormSection>
                        <AdminFormSection title="Media" icon={Camera} dense>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Zdjęcia i pliki</span>
                                <div className="flex items-center gap-2">
                                    <label className="px-3 py-1 text-sm border rounded-md hover:bg-accent cursor-pointer">
                                        {isUploading ? "Wysyłanie..." : "Wyślij pliki"}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            disabled={isUploading}
                                            onChange={(e) => {
                                                void uploadMediaFiles(e.target.files);
                                                e.currentTarget.value = "";
                                            }}
                                            className="hidden"
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addMedia}
                                        className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-1">
                                        <Plus className="h-4 w-4" />
                                        Dodaj ręcznie
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2 max-h-256 overflow-y-auto">
                                {(editedProduct.media || []).map((media, index) => (
                                    <div
                                        key={index}
                                        className="flex gap-2 items-start p-2 border rounded-md">
                                        <div className="flex-1 grid grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                placeholder="Ścieżka"
                                                value={media.path || ""}
                                                onChange={(e) =>
                                                    updateMedia(index, "path", e.target.value)
                                                }
                                                className="px-2 py-1.5 border rounded-md text-sm"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Alt"
                                                value={media.alt || ""}
                                                onChange={(e) =>
                                                    updateMedia(index, "alt", e.target.value)
                                                }
                                                className="px-2 py-1.5 border rounded-md text-sm"
                                            />
                                            <select
                                                value={media.typ || "image"}
                                                onChange={(e) =>
                                                    updateMedia(index, "typ", e.target.value)
                                                }
                                                className="px-2 py-1.5 border rounded-md text-sm col-span-2">
                                                <option value="image">Obraz</option>
                                                <option value="video">Video</option>
                                                <option value="pdf">PDF</option>
                                                <option value="other">Inne</option>
                                            </select>
                                            {media.path && media.typ === "image" && (
                                                <div className="relative w-full h-20 border rounded-md overflow-hidden col-span-2">
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
                                            type="button"
                                            onClick={() => removeMedia(index)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                                            <Minus className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {(editedProduct.media || []).length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-3">
                                        Brak mediów
                                    </p>
                                )}
                            </div>
                        </AdminFormSection>

                        <AdminFormSection title="Kategorie i producent" icon={BookOpen} dense>
                            <AdminCategoryPicker
                                categories={categoryTree.categories}
                                categoriesSlug={categoryTree.categoriesSlug}
                                selectedMainCategory={categoryTree.selectedMainCategory}
                                selectedSubCategories={categoryTree.selectedSubCategories}
                                onMainCategoryChange={categoryTree.handleMainCategoryChange}
                                onSubCategoryToggle={categoryTree.handleSubCategoryToggle}
                                variant="modal"
                                parseMainLabels
                            />
                            <div>
                                <label className="block text-sm font-medium mb-1">Producent *</label>
                                <select
                                    value={selectedProducent}
                                    onChange={(e) =>
                                        handleProducentChange(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border rounded-md">
                                    <option value="">Wybierz producenta</option>
                                    {producents.map((prod) => (
                                        <option key={prod.nazwa} value={prod._id}>
                                            {prod.nazwa}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </AdminFormSection>

                        <AdminFormSection title="Specyfikacja" icon={ListChecks} dense>
                            <div className="space-y-4">
                                <AdminProductShippingDims
                                    variant="modal"
                                    value={{
                                        szerokosc: editedProduct.szerokosc,
                                        wysokosc: editedProduct.wysokosc,
                                        dlugosc: editedProduct.dlugosc,
                                        waga: editedProduct.waga,
                                    }}
                                    onChange={(dims) =>
                                        setEditedProduct((prev) => ({ ...prev, ...dims }))
                                    }
                                />
                                <AdminSpecListEditor
                                    items={editedProduct.specyfikacja || []}
                                    onChange={(spec) => updateField("specyfikacja", spec)}
                                    variant="modal"
                                    showHeader={true}
                                    title="Dodatkowe atrybuty"
                                />
                            </div>
                        </AdminFormSection>



                        <AdminFormSection
                            title="Warianty"
                            icon={Box}
                            dense
                            className={adminFormSpanFull}>
                            <ProductVariantsEditor
                                warianty={editedProduct.wariant || []}
                                onChange={(w) => updateField("wariant", w)}
                                vatPercent={editedProduct.vat ?? 23}
                                cenaTyp={cenaTyp}
                                variant="modal"
                                lockFirstVariantQty
                                showSectionHeader={false}
                            />
                        </AdminFormSection>
                    </div>
                </div>

                <div className="flex items-center justify-between px-5 py-4 border-t bg-muted/50 shrink-0">
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
