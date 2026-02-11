"use client";

import { useState, useEffect } from "react";
import "@/app/globals2.css";
import { Courses, Categories, Firmy, Media } from "@/lib/types/coursesTypes.";
import { makeSlugKeys, parseSlugName } from "@/lib/utils_admin";
import { useRouter } from "next/navigation";
import { Plus, X, Clock, Users, BookOpen, Award, Globe } from "lucide-react";

// Helper do generowania slug
function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export default function NewCoursePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Podstawowe dane szkolenia
    const [nazwa, setNazwa] = useState<string>("");
    const [slug, setSlug] = useState<string>("");
    const [cena, setCena] = useState<number>(0);
    const [krotkiOpis, setKrotkiOpis] = useState<string>(""); // Krótki opis (jak subtitle na Udemy)
    const [opis, setOpis] = useState<string>(""); // Pełny opis
    const [ocena, setOcena] = useState<number>(0);
    const [vat, setVat] = useState<number>(23);
    const [aktywne, setAktywne] = useState<boolean>(true);

    // Pola specyficzne dla szkoleń
    const [czasTrwania, setCzasTrwania] = useState<string>(""); // np. "10 godzin"
    const [poziom, setPoziom] = useState<string>("poczatkujacy"); // Początkujący, Średniozaawansowany, Zaawansowany
    const [liczbaLekcji, setLiczbaLekcji] = useState<number>(0);
    const [instruktor, setInstruktor] = useState<string>(""); // Nazwa instruktora
    const [jezyk, setJezyk] = useState<string>("polski");
    const [certyfikat, setCertyfikat] = useState<boolean>(false);

    // Kategorie i firma
    const [categories, setCategories] = useState<Record<string, Categories[]>>({});
    const [categoriesSlug, setCategoriesSlug] = useState<string[]>([]);
    const [selectedMainCategory, setSelectedMainCategory] = useState<string>("");
    const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
    const [firmy, setFirmy] = useState<Firmy[]>([]);
    const [selectedFirma, setSelectedFirma] = useState<string>("");

    // Media - główne zdjęcie + galeria
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string>("");
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreview, setGalleryPreview] = useState<string[]>([]);

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

    // Pobierz firmy
    useEffect(() => {
        async function fetchFirmy() {
            try {
                const response = await fetch("/admin/api/v1/firmy", {
                    method: "GET",
                    credentials: "include",
                });
                const data = await response.json();
                if (Array.isArray(data)) {
                    setFirmy(data);
                }
            } catch (error) {
                console.error("Błąd podczas pobierania firm:", error);
            }
        }
        fetchFirmy();
    }, []);

    // Obsługa wyboru głównej kategorii
    const handleMainCategoryChange = (mainSlug: string) => {
        setSelectedMainCategory(mainSlug);
        setSelectedSubCategories([]);
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

    // Obsługa głównego zdjęcia
    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];
        setMainImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setMainImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    // Obsługa galerii
    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setGalleryFiles((prev) => [...prev, ...files]);
        
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setGalleryPreview((prev) => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeGalleryImage = (index: number) => {
        setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
        setGalleryPreview((prev) => prev.filter((_, i) => i !== index));
    };

    // Wysyłanie szkolenia
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Przygotuj kategorie
            const selectedCategories: (string | Categories)[] = [];
            if (selectedMainCategory && categories[selectedMainCategory]) {
                categories[selectedMainCategory].forEach((cat) => {
                    if (selectedSubCategories.includes(cat._id || "")) {
                        selectedCategories.push(cat);
                    }
                });
            }

            // Przygotuj firmę
            const firmaData = firmy.find((f) => f._id === selectedFirma);
            if (!firmaData) {
                alert("Wybierz firmę");
                setIsSubmitting(false);
                return;
            }

            // Przygotuj media - główne zdjęcie + galeria
            const mediaData: Media[] = [];
            if (mainImageFile) {
                mediaData.push({
                    nazwa: mainImageFile.name,
                    slug: generateSlug(mainImageFile.name),
                    typ: "image",
                    alt: nazwa || "Główne zdjęcie szkolenia",
                    path: "", // Będzie wypełnione po uploadzie
                });
            }
            galleryFiles.forEach((file) => {
                mediaData.push({
                    nazwa: file.name,
                    slug: generateSlug(file.name),
                    typ: "image",
                    alt: file.name,
                    path: "", // Będzie wypełnione po uploadzie
                });
            });

            // Przygotuj kurs - BEZ wariantów, z polami specyficznymi dla szkoleń
            const courseData: Courses = {
                slug,
                nazwa,
                cena: cena,
                kategoria: selectedCategories,
                firma: firmaData._id || firmaData,
                media: mediaData,
                opis: opis || krotkiOpis, // Używamy pełnego opisu, jeśli nie ma to krótki
                ocena,
                opinie: null,
                vat,
                sku: null, // Nie używamy SKU dla szkoleń
                aktywne: aktywne,
                // Pola specyficzne dla szkoleń
                czasTrwania: czasTrwania || undefined,
                poziom: poziom || undefined,
                liczbaLekcji: liczbaLekcji > 0 ? liczbaLekcji : undefined,
                instruktor: instruktor || undefined,
                jezyk: jezyk || "polski",
                certyfikat: certyfikat || false,
                krotkiOpis: krotkiOpis || undefined,
            };

            const response = await fetch("/admin/api/v1/courses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(courseData),
            });

            const result = await response.json();
            
            if (result.status === 201 || response.ok) {
                alert("Szkolenie zostało dodane pomyślnie!");
                router.push("/admin/courses");
            } else {
                alert("Błąd podczas dodawania szkolenia: " + (result.error || "Nieznany błąd"));
            }
        } catch (error) {
            console.error("Błąd podczas dodawania szkolenia:", error);
            alert("Błąd podczas dodawania szkolenia. Sprawdź konsolę.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Utwórz nowe szkolenie
                </h1>
                <p className="text-sm text-muted-foreground sm:text-base mt-2">
                    Wypełnij formularz, aby dodać nowe szkolenie do oferty.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Sekcja 1: Podstawowe informacje */}
                <div className="rounded-lg border p-6 space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Podstawowe informacje
                    </h2>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium mb-2">
                                Tytuł szkolenia *
                            </label>
                            <input
                                type="text"
                                value={nazwa}
                                onChange={(e) => setNazwa(e.target.value)}
                                required
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="Np. Kompleksowy kurs strzyżenia męskiego"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Slug: {slug || "(auto-generowany z tytułu)"}
                            </p>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium mb-2">
                                Krótki opis (subtitle) *
                            </label>
                            <input
                                type="text"
                                value={krotkiOpis}
                                onChange={(e) => setKrotkiOpis(e.target.value)}
                                required
                                maxLength={120}
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="Krótkie podsumowanie szkolenia (max 120 znaków)"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                {krotkiOpis.length}/120 znaków
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Cena (bez VAT) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={cena}
                                onChange={(e) => setCena(parseFloat(e.target.value) || 0)}
                                required
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                VAT (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={vat}
                                onChange={(e) => setVat(parseFloat(e.target.value) || 23)}
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>
                </div>

                {/* Sekcja 2: Szczegóły szkolenia */}
                <div className="rounded-lg border p-6 space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Szczegóły szkolenia
                    </h2>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Czas trwania *
                            </label>
                            <input
                                type="text"
                                value={czasTrwania}
                                onChange={(e) => setCzasTrwania(e.target.value)}
                                required
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="Np. 10 godzin, 5 tygodni"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Poziom zaawansowania *
                            </label>
                            <select
                                value={poziom}
                                onChange={(e) => setPoziom(e.target.value)}
                                required
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring">
                                <option value="poczatkujacy">Początkujący</option>
                                <option value="sredniozaawansowany">Średniozaawansowany</option>
                                <option value="zaawansowany">Zaawansowany</option>
                                <option value="wszystkie">Wszystkie poziomy</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Liczba lekcji
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={liczbaLekcji}
                                onChange={(e) => setLiczbaLekcji(parseInt(e.target.value) || 0)}
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Instruktor
                            </label>
                            <input
                                type="text"
                                value={instruktor}
                                onChange={(e) => setInstruktor(e.target.value)}
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="Nazwa instruktora"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Język
                            </label>
                            <select
                                value={jezyk}
                                onChange={(e) => setJezyk(e.target.value)}
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring">
                                <option value="polski">Polski</option>
                                <option value="angielski">Angielski</option>
                                <option value="niemiecki">Niemiecki</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 pt-6">
                            <input
                                type="checkbox"
                                checked={certyfikat}
                                onChange={(e) => setCertyfikat(e.target.checked)}
                                className="w-4 h-4"
                                id="certyfikat"
                            />
                            <label htmlFor="certyfikat" className="text-sm font-medium cursor-pointer">
                                Certyfikat ukończenia
                            </label>
                        </div>
                    </div>
                </div>

                {/* Sekcja 3: Opis */}
                <div className="rounded-lg border p-6 space-y-6">
                    <h2 className="text-xl font-semibold">Opis szkolenia</h2>
                    
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Pełny opis *
                        </label>
                        <textarea
                            rows={8}
                            value={opis}
                            onChange={(e) => setOpis(e.target.value)}
                            required
                            className="w-full resize-none rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                            placeholder="Szczegółowy opis szkolenia, czego się nauczysz, program kursu..."
                        />
                    </div>
                </div>

                {/* Sekcja 4: Kategorie i firma */}
                <div className="rounded-lg border p-6 space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Kategorie i organizator
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Kategorie *
                            </label>
                            <div className="space-y-2">
                                <select
                                    value={selectedMainCategory}
                                    onChange={(e) => handleMainCategoryChange(e.target.value)}
                                    required
                                    className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring">
                                    <option value="">Wybierz główną kategorię</option>
                                    {categoriesSlug.map((slug) => (
                                        <option key={slug} value={slug}>
                                            {parseSlugName(slug)}
                                        </option>
                                    ))}
                                </select>
                                {selectedMainCategory && categories[selectedMainCategory] && (
                                    <div className="space-y-2 mt-2">
                                        <label className="text-xs text-muted-foreground">
                                            Wybierz podkategorie (wiele):
                                        </label>
                                        {categories[selectedMainCategory].map((cat) => (
                                            <label
                                                key={cat._id || cat.nazwa}
                                                className="flex items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-accent">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSubCategories.includes(cat._id || "")}
                                                    onChange={() =>
                                                        handleSubCategoryToggle(cat._id || "")
                                                    }
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm">{cat.nazwa}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Firma prowadząca *
                            </label>
                            <select
                                value={selectedFirma}
                                onChange={(e) => setSelectedFirma(e.target.value)}
                                required
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring">
                                <option value="">Wybierz firmę</option>
                                {firmy.map((firma) => (
                                    <option key={firma._id || firma.nazwa} value={firma._id || ""}>
                                        {firma.nazwa}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Sekcja 5: Zdjęcia */}
                <div className="rounded-lg border p-6 space-y-6">
                    <h2 className="text-xl font-semibold">Zdjęcia szkolenia</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Główne zdjęcie (banner) *
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleMainImageChange}
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                            />
                            {mainImagePreview && (
                                <div className="mt-4 relative w-full h-48 rounded-lg overflow-hidden border">
                                    <img
                                        src={mainImagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMainImageFile(null);
                                            setMainImagePreview("");
                                        }}
                                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Galeria zdjęć
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleGalleryChange}
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                            />
                            {galleryPreview.length > 0 && (
                                <div className="grid grid-cols-4 gap-4 mt-4">
                                    {galleryPreview.map((preview, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={preview}
                                                alt={`Gallery ${index}`}
                                                className="w-full h-32 object-cover rounded-lg border"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(index)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sekcja 6: Status */}
                <div className="rounded-lg border p-6">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={aktywne}
                            onChange={(e) => setAktywne(e.target.checked)}
                            className="w-4 h-4"
                            id="aktywne"
                        />
                        <label htmlFor="aktywne" className="text-sm font-medium cursor-pointer">
                            Szkolenie aktywne (widoczne w sklepie)
                        </label>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 border rounded-md hover:bg-accent transition-colors">
                        Anuluj
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Zapisywanie...
                            </>
                        ) : (
                            <>
                                <Award className="h-4 w-4" />
                                Utwórz szkolenie
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
