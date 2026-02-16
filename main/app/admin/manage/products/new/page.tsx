"use client";

import { useState, useEffect, useCallback } from "react";
import "@/app/globals2.css";
import { Products, Producents, Warianty } from "@/lib/types/productTypes";
import { Categories } from "@/lib/types/shared";
import { makeSlugKeys, parseSlugName } from "@/lib/utils_admin";
import { useRouter } from "next/navigation";
import { Plus, Minus, X } from "lucide-react";

// Helper do generowania slug
function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export default function NewProductPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Podstawowe dane produktu
    const [nazwa, setNazwa] = useState<string>("");
    const [slug, setSlug] = useState<string>("");
    const [cena, setCena] = useState<number>(0);
    const [cena_skupu, setCena_skupu] = useState<number>(0);
    const [dostepnosc, setDostepnosc] = useState<string>("duza");
    const [opis, setOpis] = useState<string>("");
    const [ilosc, setIlosc] = useState<number>(0);
    const [czas_wysylki, setCzas_wysylki] = useState<number>(1);
    const [kod_produkcyjny, setKod_produkcyjny] = useState<string>("");
    const [ocena, setOcena] = useState<number>(0);
    const [vat, setVat] = useState<number>(23);
    const [kod_ean, setKod_ean] = useState<string>("");
    const [sku, setSku] = useState<string>("");
    const [aktywne, setAktywne] = useState<boolean>(true);

    // Kategorie i producent
    const [categories, setCategories] = useState<Record<string, Categories[]>>(
        {},
    );
    const [categoriesSlug, setCategoriesSlug] = useState<string[]>([]);
    const [selectedMainCategory, setSelectedMainCategory] =
        useState<string>("");
    const [selectedSubCategories, setSelectedSubCategories] = useState<
        string[]
    >([]);
    const [producents, setProducents] = useState<Producents[]>([]);
    const [selectedProducent, setSelectedProducent] = useState<string>("");

    // Media
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [mediaPreview, setMediaPreview] = useState<string[]>([]);

    // Specyfikacja
    const [specyfikacja, setSpecyfikacja] = useState<
        Array<{ key: string; value: string }>
    >([]);

    // Warianty
    const [warianty, setWarianty] = useState<Warianty[]>([]);

    // Auto-generuj slug z nazwy
    useEffect(() => {
        if (nazwa) {
            setSlug(generateSlug(nazwa));
        }
    }, [nazwa]);

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
                }
            } catch (error) {
                console.error("Błąd podczas pobierania producentów:", error);
            }
        }
        fetchProducents();
    }, []);

    // Obsługa wyboru głównej kategorii
    const handleMainCategoryChange = (mainSlug: string) => {
        setSelectedMainCategory(mainSlug);
        setSelectedSubCategories([]); // Reset podkategorii przy zmianie głównej
    };

    // Obsługa wyboru podkategorii
    const handleSubCategoryToggle = (subCategoryId: string) => {
        setSelectedSubCategories((prev) => {
            if (prev.includes(subCategoryId)) {
                return prev.filter((id) => id !== subCategoryId);
            } else {
                return [...prev, subCategoryId];
            }
        });
    };

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

    // Obsługa specyfikacji
    const addSpecyfikacja = () => {
        setSpecyfikacja((prev) => [...prev, { key: "", value: "" }]);
    };

    const updateSpecyfikacja = (
        index: number,
        field: "key" | "value",
        value: string,
    ) => {
        setSpecyfikacja((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const removeSpecyfikacja = (index: number) => {
        setSpecyfikacja((prev) => prev.filter((_, i) => i !== index));
    };

    // Obsługa wariantów
    const addWariant = () => {
        setWarianty((prev) => [
            ...prev,
            {
                nazwa: "",
                slug: "",
                typ: "kolor",
                ilosc: 0,
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
        setWarianty((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            // Auto-generuj slug z nazwy wariantu
            if (field === "nazwa" && value) {
                updated[index].slug = generateSlug(value);
            }
            return updated;
        });
    };

    const removeWariant = (index: number) => {
        setWarianty((prev) => prev.filter((_, i) => i !== index));
    };

    // Wysyłanie produktu
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Przygotuj kategorie - muszą być ObjectId lub pełne obiekty Categories
            const selectedCategories: (string | Categories)[] = [];
            if (selectedMainCategory && categories[selectedMainCategory]) {
                categories[selectedMainCategory].forEach((cat) => {
                    if (selectedSubCategories.includes(cat._id || "")) {
                        selectedCategories.push(cat._id as string);
                    }
                });
            }

            // Przygotuj producent - musi być ObjectId lub pełny obiekt
            const producentData = producents.find(
                (p) => p._id === selectedProducent,
            );
            if (!producentData) {
                alert("Wybierz producenta");
                setIsSubmitting(false);
                return;
            }

            // Przygotuj media - na razie tylko podstawowe dane, upload będzie osobno
            const mediaData = mediaFiles.map((file, index) => ({
                nazwa: file.name,
                slug: generateSlug(file.name),
                typ: "image" as const,
                alt: file.name,
                path: "", // Będzie wypełnione po uploadzie
            }));
            console.log(warianty);
            console.log(typeof warianty);
            // Przygotuj produkt zgodny ze schematem
            const productData: Products = {
                slug,
                nazwa,
                cena_skupu: cena_skupu,
                cena: cena,
                dostepnosc: dostepnosc,
                kategoria: selectedCategories,
                producent: producentData._id || producentData,
                media: mediaData,
                opis,
                ilosc,
                czas_wysylki,
                kod_produkcyjny,
                ocena,
                opinie: null,
                vat,
                promocje: null,
                wariant: warianty.length > 0 ? warianty as Warianty[] : undefined,
                kod_ean: kod_ean || null,
                sku: sku,
                aktywne: aktywne,
                specyfikacja:
                    specyfikacja.length > 0 ? specyfikacja : undefined,
            };

            const response = await fetch("/admin/api/v1/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(productData),
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
            console.error("Błąd podczas dodawania produktu:", error);
            alert("Błąd podczas dodawania produktu. Sprawdź konsolę.");
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

            <form
                onSubmit={handleSubmit}
                className="grid gap-4 rounded-lg border p-3 sm:p-4 sm:grid-cols-2">
                {/* Nazwa i Slug */}
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">Nazwa *</label>
                    <input
                        type="text"
                        value={nazwa}
                        onChange={(e) => setNazwa(e.target.value)}
                        required
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        placeholder="Np. Szampon wygładzający"
                    />
                    <span className="text-xs text-muted-foreground">
                        Slug (auto-generowany): {slug || "(wpisz nazwę)"}
                    </span>
                </div>

                {/* Cena i Cena skupu */}
                <div className="grid gap-2">
                    <label className="text-sm font-medium">
                        Cena (bez VAT) *
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={cena}
                        onChange={(e) =>
                            setCena(parseFloat(e.target.value) || 0)
                        }
                        required
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        placeholder="0.00"
                    />
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium">
                        Cena skupu (analityka) *
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={cena_skupu}
                        onChange={(e) =>
                            setCena_skupu(parseFloat(e.target.value) || 0)
                        }
                        required
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        placeholder="0.00"
                    />
                </div>

                {/* Dostępność */}
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Dostępność *</label>
                    <select
                        value={dostepnosc}
                        onChange={(e) => setDostepnosc(e.target.value)}
                        required
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring">
                        <option value="duza">Duża</option>
                        <option value="ograniczona">Ograniczona</option>
                        <option value="mała">Mała</option>
                        <option value="niedostępne">Niedostępne</option>
                    </select>
                </div>

                {/* Stan magazynowy */}
                <div className="grid gap-2">
                    <label className="text-sm font-medium">
                        Stan magazynowy *
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={ilosc}
                        onChange={(e) =>
                            setIlosc(parseInt(e.target.value) || 0)
                        }
                        required
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        placeholder="0"
                    />
                </div>

                {/* Opis */}
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">Opis *</label>
                    <textarea
                        rows={4}
                        value={opis}
                        onChange={(e) => setOpis(e.target.value)}
                        required
                        className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        placeholder="Krótki opis produktu"
                    />
                </div>

                {/* Kategorie */}
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">Kategorie *</label>
                    <div className="space-y-2">
                        <select
                            value={selectedMainCategory}
                            onChange={(e) =>
                                handleMainCategoryChange(e.target.value)
                            }
                            required
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring">
                            <option value="">Wybierz główną kategorię</option>
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

                {/* Producent */}
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">Producent *</label>
                    <select
                        value={selectedProducent}
                        onChange={(e) => setSelectedProducent(e.target.value)}
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

                {/* Media */}
                <div className="grid gap-2 sm:col-span-2">
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
                                    <img
                                        src={preview}
                                        alt={`Preview ${index}`}
                                        className="w-full h-24 object-cover rounded-md border"
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
                </div>

                {/* Specyfikacja */}
                <div className="grid gap-2 sm:col-span-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                            Specyfikacja
                        </label>
                        <button
                            type="button"
                            onClick={addSpecyfikacja}
                            className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-1">
                            <Plus className="h-3 w-3" />
                            Dodaj
                        </button>
                    </div>
                    <div className="space-y-2">
                        {specyfikacja.map((spec, index) => (
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
                                    className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
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
                                    className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeSpecyfikacja(index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                                    <Minus className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Warianty */}
                <div className="grid gap-2 sm:col-span-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Warianty</label>
                        <button
                            type="button"
                            onClick={addWariant}
                            className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-1">
                            <Plus className="h-3 w-3" />
                            Dodaj wariant
                        </button>
                    </div>
                    <div className="space-y-4">
                        {warianty.map((wariant, index) => (
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
                                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
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
                                            className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                                            <option value="kolor">Kolor</option>
                                            <option value="rozmiar">
                                                Rozmiar
                                            </option>
                                            <option value="objetosc">
                                                Objętość
                                            </option>
                                            <option value="specjalna">
                                                Specjalna
                                            </option>
                                            <option value="hurt">Hurt</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Pola zależne od typu */}
                                {wariant.typ === "kolor" && (
                                    <div className="grid grid-cols-3 gap-2">
                                        <input
                                            type="text"
                                            placeholder="Nazwa koloru"
                                            value={wariant.kolory?.name || ""}
                                            onChange={(e) =>
                                                updateWariant(
                                                    index,
                                                    "kolory",
                                                    {
                                                        ...wariant.kolory,
                                                        name: e.target.value,

                                                    },
                                                )
                                            }
                                            className="rounded-md border bg-background px-3 py-2 text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Wartość"
                                            value={wariant.kolory?.hex || "#000000"}
                                            disabled={true}
                                            className="rounded-md border bg-background px-3 py-2 text-sm"
                                        />
                                        <input
                                            type="color"
                                            value={
                                                wariant.kolory?.hex || "#000000"
                                            }
                                            onChange={(e) =>
                                                updateWariant(
                                                    index,
                                                    "kolory",
                                                    {
                                                        ...wariant.kolory,
                                                        hex: e.target.value,
                                                        val: e.target.value,
                                                    },
                                                )
                                            }
                                            className="rounded-md border bg-background h-10"
                                        />
                                    </div>
                                )}
                                {wariant.typ === "rozmiar" && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="Nazwa rozmiaru"
                                            value={wariant.rozmiary?.name || ""}
                                            onChange={(e) =>
                                                updateWariant(
                                                    index,
                                                    "rozmiary",
                                                    {
                                                        ...wariant.rozmiary,
                                                        name: e.target.value,
                                                        val: e.target.value,
                                                    },
                                                )
                                            }
                                            className="rounded-md border bg-background px-3 py-2 text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Wartość"
                                            value={wariant.rozmiary?.val || ""}
                                            onChange={(e) =>
                                                updateWariant(
                                                    index,
                                                    "rozmiary",
                                                    {
                                                        ...wariant.rozmiary,
                                                        val: e.target.value,
                                                    },
                                                )
                                            }
                                            className="rounded-md border bg-background px-3 py-2 text-sm"
                                        />
                                    </div>
                                )}
                                {wariant.typ === "objetosc" && (
                                    <div>
                                        <input
                                            type="number"
                                            placeholder="Objętość (ml)"
                                            value={wariant.objetosc || ""}
                                            onChange={(e) =>
                                                updateWariant(
                                                    index,
                                                    "objetosc",
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                                )
                                            }
                                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
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
                                            value={wariant.nowa_cena || ""}
                                            onChange={(e) =>
                                                updateWariant(
                                                    index,
                                                    "nowa_cena",
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                                )
                                            }
                                            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
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
                                            value={wariant.cena_skupu || ""}
                                            onChange={(e) =>
                                                updateWariant(
                                                    index,
                                                    "cena_skupu",
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                                )
                                            }
                                            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
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
                                                        parseInt(e.target.value) ||
                                                        undefined,
                                                    )
                                                }
                                                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
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

                {/* Dodatkowe pola */}
                <div className="grid grid-cols-2 gap-4 sm:col-span-2">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">
                            Czas wysyłki (dni) *
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={czas_wysylki}
                            onChange={(e) =>
                                setCzas_wysylki(parseInt(e.target.value) || 1)
                            }
                            required
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">
                            Kod produkcyjny *
                        </label>
                        <input
                            type="text"
                            value={kod_produkcyjny}
                            onChange={(e) => setKod_produkcyjny(e.target.value)}
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
                            value={vat}
                            onChange={(e) =>
                                setVat(parseFloat(e.target.value) || 23)
                            }
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Ocena</label>
                        <input
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            value={ocena}
                            onChange={(e) =>
                                setOcena(parseFloat(e.target.value) || 0)
                            }
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Kod EAN</label>
                        <input
                            type="text"
                            value={kod_ean}
                            onChange={(e) => setKod_ean(e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">SKU</label>
                        <input
                            type="text"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                {/* Aktywne */}
                <div className="flex items-center gap-2 sm:col-span-2">
                    <input
                        type="checkbox"
                        checked={aktywne}
                        onChange={(e) => setAktywne(e.target.checked)}
                        className="w-4 h-4"
                    />
                    <label className="text-sm font-medium">
                        Produkt aktywny
                    </label>
                </div>

                {/* Submit */}
                <div className="sm:col-span-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50">
                        {isSubmitting ? "Zapisywanie..." : "Zapisz produkt"}
                    </button>
                </div>
            </form>
        </div>
    );
}
