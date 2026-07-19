"use client";

import { useState, useEffect, } from "react";
import "@/app/globals2.css";
import { Products, Producents, Warianty, zodProducts } from "@/lib/types/productTypes";
import { generateSlug } from "@/lib/utils_admin";
import { useRouter } from "next/navigation";
import { X, BookOpen, Camera, ListChecks, Box, AlertCircle } from "lucide-react";
import Image from "next/image";
import { CenaTyp } from "@/lib/admin/pricing";
import { useCategoryTree } from "@/components/admin/hooks/useCategoryTree";
import AdminCategoryPicker from "@/components/admin/AdminCategoryPicker";
import AdminPriceVatFields from "@/components/admin/AdminPriceVatFields";
import AdminSpecListEditor from "@/components/admin/AdminSpecListEditor";
import AdminProductShippingDims from "@/components/admin/AdminProductShippingDims";
import ProductVariantsEditor from "@/components/admin/ProductVariantsEditor";
import {
    AdminFormSection,
    adminFormPageGrid,
    adminFormSpanFull,
} from "@/components/admin/AdminFormLayout";
import { uploadAdminFile } from "@/lib/admin/uploadFile";


export default function NewProductPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const [payload, setPayload] = useState<Products>({
        nazwa: "",
        slug: "",
        cena_skupu: 0,
        cena: 0,
        dostepnosc: "duza",
        opis: "",
        ilosc: 0,
        czas_wysylki: 1,
        kod_produkcyjny: "",
        ocena: 0,
        vat: 23,
        kod_ean: "",
        sku: "",
        aktywne: true,
        specyfikacja: [],
        szerokosc: 0,
        wysokosc: 0,
        dlugosc: 0,
        waga: 0,
        wariant: [],
        kategoria: [],
        producent: "",
        media: [],
        opinie: [],
        promocje: null,
    })

    const handleUpdatePayload = <K extends keyof Products>(key: K, value: Products[K]) => {
        switch (key) {
            case "kod_ean":
            case "kod_produkcyjny":
            case "sku":
                if (key != "kod_ean" && key != "sku") {
                    setError("EAN albo SKU jest wymagany");
                } else {
                    setError(null);
                }
                setPayload((prev) => ({
                    ...prev,
                    [key]: value,
                }));
            default:
                setPayload((prev) => ({
                    ...prev,
                    [key]: value,
                }));
        }
    };


    const categoryTree = useCategoryTree();
    const [producents, setProducents] = useState<Producents[]>([]);

    // Media
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [mediaPreview, setMediaPreview] = useState<string[]>([]);

    // Warianty
    const [warianty, setWarianty] = useState<Warianty[]>([]);

    const [cenaTyp, setCenaTyp] = useState<CenaTyp>("brutto");

    // Auto-generuj slug z nazwy
    useEffect(() => {
        if (payload.nazwa) {
            handleUpdatePayload("slug", generateSlug(payload.nazwa));
        }
    }, [payload.nazwa]);

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
                }
            } catch (error) {
                console.error("Błąd podczas pobierania producentów:", error);
            }
        }
        fetchProducents();
    }, []);

    // Obsługa mediów
    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setMediaFiles((prev) => [...prev, ...files]);

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview((prev) => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeMedia = (index: number) => {
        setMediaFiles((prev) => prev.filter((_, i) => i !== index));
        setMediaPreview((prev) => prev.filter((_, i) => i !== index));
    };

    // Wysyłanie produktu
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const selectedCategories = categoryTree.getSelectedCategoryIds();
            handleUpdatePayload("kategoria", selectedCategories);

            const mediaData: Array<{ nazwa: string; slug: string; typ: "image"; alt: string; path: string }> = [];
            const parentFolder = "products";
            for (const file of mediaFiles) {
                const path = await uploadAdminFile({ file, parent: parentFolder });
                mediaData.push({
                    nazwa: file.name,
                    slug: generateSlug(file.name),
                    typ: "image",
                    alt: file.name,
                    path,
                });
            }

            // Przygotuj producent - musi być ObjectId lub pełny obiekt
            const producentData = producents.find(
                (p) => p._id === (payload.producent as string),
            );
            if (!producentData) {
                alert("Wybierz producenta");
                setIsSubmitting(false);
                return;
            }

            if (
                !(payload.szerokosc > 0) ||
                !(payload.wysokosc > 0) ||
                !(payload.dlugosc > 0) ||
                !(payload.waga > 0)
            ) {
                setError("Uzupełnij wymiary paczki i wagę w Specyfikacji (X, Y, Z, waga).");
                setIsSubmitting(false);
                return;
            }

            const rawPayload = {
                ...payload,
                media: mediaData,
            };

            const response = await fetch("/admin/api/v1/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(rawPayload),
            });

            const result = await response.json();

            if (result.status === 201 || response.ok) {
                alert("Produkt został dodany pomyślnie!");
                router.push("/admin/manage/products");
            } else {
                alert(
                    "Błąd podczas dodawania produktu: " +
                    (result.error || "Nieznany błąd"),
                );
            }
        } catch (error) {
            alert("Błąd podczas dodawania produktu: " + error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    Dodaj produkt
                </h1>
                <p className="text-sm text-muted-foreground sm:text-base">
                    Uzupełnij podstawowe informacje o produkcie.
                </p>
            </div>

            <form onSubmit={handleSubmit} className={adminFormPageGrid}>
                <AdminFormSection title="Podstawowe informacje" icon={BookOpen}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium">Nazwa *</label>
                            <input
                                type="text"
                                value={payload.nazwa}
                                onChange={(e) => handleUpdatePayload("nazwa", e.target.value)}
                                required
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="Np. Szampon wygładzający"
                            />
                            <span className="text-xs text-muted-foreground">
                                Slug (auto-generowany): {payload.slug || "(wpisz nazwę)"}
                            </span>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium">Opis *</label>
                            <textarea
                                rows={4}
                                value={payload.opis}
                                onChange={(e) => handleUpdatePayload("opis", e.target.value)}
                                required
                                className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="Krótki opis produktu"
                            />
                        </div>

                        <AdminPriceVatFields
                            label="Cena *"
                            required
                            storedNetValue={payload.cena}
                            vatPercent={payload.vat}
                            cenaTyp={cenaTyp}
                            onStoredNetChange={(v) => handleUpdatePayload("cena", v)}
                            onCenaTypChange={setCenaTyp}
                        />
                        <AdminPriceVatFields
                            label="Cena skupu (analityka) *"
                            required
                            storedNetValue={payload.cena_skupu}
                            vatPercent={payload.vat}
                            cenaTyp={cenaTyp}
                            onStoredNetChange={(v) => handleUpdatePayload("cena_skupu", v)}
                            onCenaTypChange={setCenaTyp}
                            previewPrefix="Cena skupu z VAT"
                        />

                        {/* Dostępność */}
                        <div className="">
                            <label className="text-sm font-medium">Dostępność *</label>
                            <select
                                value={payload.dostepnosc}
                                onChange={(e) => handleUpdatePayload("dostepnosc", e.target.value)}
                                required
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring">
                                <option value="duza">Duża</option>
                                <option value="ograniczona">Ograniczona</option>
                                <option value="mała">Mała</option>
                                <option value="niedostępne">Niedostępne</option>
                            </select>
                        </div>

                        {/* Stan magazynowy */}
                        <div className="">
                            <label className="text-sm font-medium">
                                Stan magazynowy *
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={payload.ilosc}
                                onChange={(e) =>
                                    handleUpdatePayload("ilosc", parseInt(e.target.value) || 0)
                                }
                                required
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="0"
                            />
                        </div>

                    </div>
                </AdminFormSection>

                <AdminFormSection title="Kategorie i producent" icon={BookOpen}>
                    <div className="space-y-4">
                        <label className="text-sm font-medium">Kategorie *</label>
                        <AdminCategoryPicker
                            categories={categoryTree.categories}
                            categoriesSlug={categoryTree.categoriesSlug}
                            selectedMainCategory={categoryTree.selectedMainCategory}
                            selectedSubCategories={categoryTree.selectedSubCategories}
                            onMainCategoryChange={categoryTree.handleMainCategoryChange}
                            onSubCategoryToggle={categoryTree.handleSubCategoryToggle}
                            required
                        />
                    </div>

                    {/* Producent */}
                    <div className="grid gap-2 sm:col-span-2">
                        <label className="text-sm font-medium">Producent *</label>
                        <select
                            value={(payload.producent as string)}
                            onChange={(e) => handleUpdatePayload("producent", e.target.value)}
                            required
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring">
                            <option value="">Wybierz producenta</option>
                            {producents.map((prod) => (
                                <option key={prod.slug} value={prod._id}>
                                    {prod.nazwa}
                                </option>
                            ))}
                        </select>
                    </div>
                </AdminFormSection>

                <AdminFormSection title="Zdjęcia i pliki" icon={Camera}>
                    <label className="text-sm font-medium">
                        Zdjęcia produktu
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleMediaChange}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                    />
                    {mediaPreview.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-2">
                            {mediaPreview.map((preview, index) => (
                                <div key={index} className="relative">
                                    <Image
                                        src={preview}
                                        alt={`Preview ${index}`}
                                        className="w-full h-24 object-cover rounded-md border"
                                        width={100}
                                        height={100}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeMedia(index)}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </AdminFormSection>

                <AdminFormSection title="Specyfikacja" icon={ListChecks}>
                    <div className="space-y-6">
                        <AdminProductShippingDims
                            value={{
                                szerokosc: payload.szerokosc,
                                wysokosc: payload.wysokosc,
                                dlugosc: payload.dlugosc,
                                waga: payload.waga,
                            }}
                            onChange={(dims) => {
                                setPayload((prev) => ({ ...prev, ...dims }));
                            }}
                        />
                        <AdminSpecListEditor
                            items={payload.specyfikacja || []}
                            onChange={(spec) => handleUpdatePayload("specyfikacja", spec)}
                            title="Dodatkowe atrybuty"
                        />
                    </div>
                </AdminFormSection>

                <AdminFormSection title="Dodatkowe pola" icon={Box}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">
                                Czas wysyłki (dni) *
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={payload.czas_wysylki}
                                onChange={(e) =>
                                    handleUpdatePayload("czas_wysylki", parseInt(e.target.value) || 1)
                                }
                                required
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">VAT (%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={payload.vat}
                                onChange={(e) =>
                                    handleUpdatePayload("vat", parseFloat(e.target.value) || 23)
                                }
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">
                                Kod produkcyjny *
                            </label>
                            <input
                                type="text"
                                value={payload.kod_produkcyjny || ""}
                                onChange={(e) => handleUpdatePayload("kod_produkcyjny", e.target.value)}
                                required
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Kod EAN</label>
                            <input
                                type="text"
                                value={payload.kod_ean || ""}
                                onChange={(e) => handleUpdatePayload("kod_ean", e.target.value)}
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">SKU</label>
                            <input
                                type="text"
                                value={payload.sku || ""}
                                onChange={(e) => handleUpdatePayload("sku", e.target.value)}
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                </AdminFormSection>

                <AdminFormSection
                    title="Warianty"
                    icon={Box}
                    className={adminFormSpanFull}>
                    <ProductVariantsEditor
                        warianty={warianty}
                        onChange={setWarianty}
                        vatPercent={payload.vat}
                        cenaTyp={cenaTyp}
                    />
                </AdminFormSection>

                <AdminFormSection
                    title="Zapis"
                    icon={ListChecks}
                    className={adminFormSpanFull}
                    dense>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={payload.aktywne ?? false}
                                onChange={(e) => handleUpdatePayload("aktywne", e.target.checked)}
                                className="w-4 h-4"
                            />
                            <label className="text-sm font-medium">
                                Produkt aktywny
                            </label>
                        </div>
                    </div>
                </AdminFormSection>
                <AdminFormSection title="Walidacja" icon={AlertCircle} className={adminFormSpanFull}>
                    <div className="space-y-4">
                        <label className="text-sm font-medium">Błędy</label>
                        {error && (
                            <div className="rounded-lg border p-4 space-y-4 bg-red-50">
                                <div className="flex items-center gap-2">
                                    <div className="text-xl">❌</div>
                                    <h2 className="text-xl font-bold mb-2">Błąd</h2>
                                    <p className="text-muted-foreground mb-4 text-red-500">{error.toString()}</p>
                                </div>
                            </div>
                        )}

                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting || error !== null}
                            className="border-3 border-primary inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
                            {isSubmitting ? "Zapisywanie..." : "Zapisz produkt"}
                        </button>
                    </div>
                </AdminFormSection>
            </form>
        </div>
    );
}
