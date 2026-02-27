"use client";

import { useState, useEffect, useMemo } from "react";
import "@/app/globals2.css";
import { Courses, Firmy, Lekcja } from "@/lib/types/coursesTypes";
import { Categories, Media } from "@/lib/types/shared";
import { useRouter } from "next/navigation";
import { X, Clock, Users, BookOpen, Award, Info } from "lucide-react";
import { Users as User, userSchema } from "@/lib/types/userTypes";
import { finalPrice } from "@/lib/utils";

// Helper do generowania slug
function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}


function calculateProwizja(cena: number, prowizja: number, prowizja_typ: string, vat: number): number {
    if (prowizja_typ === "procent") {
        return (cena * (prowizja / 100)) + ((cena * (prowizja / 100)) * vat / 100);
    } else {
        return prowizja + (prowizja * vat / 100);
    }
}


export default function NewCoursePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [coursePayload, setCoursePayload] = useState<Courses>({
        slug: "",
        nazwa: "",
        cena: 0,
        prowizja: undefined,
        prowizja_typ: undefined,
        prowizja_vat: undefined,
        kategoria: [],
        firma: "",
        lekcje: [],
        media: [],
        promocje: null,
        opis: "",
        ocena: 0,
        opinie: [],
        vat: 23,
        sku: null,
        aktywne: true,
        czasTrwania: undefined,
        poziom: undefined,
        liczbaLekcji: undefined,
        instruktor: undefined,
        jezyk: "polski",
        certyfikat: false,
        krotkiOpis: undefined,
        czegoSieNauczysz: [],
        wymagania: [],
        gwarancjaDni: undefined,
        dozywotniDostep: true,
        materialyDoPobrania: true,
        zawartoscKursu: [],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleCoursePayloadChange = (key: keyof Courses, value: any) => {
        if (key === "firma" && value !== "inna") {
            const firma = firmy.find((f) => f._id!.toString() === value) as Firmy;
            setCoursePayload((prev) => ({
                ...prev,
                firma: value,
                prowizja: firma?.prowizja,
                prowizja_typ: firma?.prowizja_typ,
                prowizja_vat: firma?.prowizja_vat,
            }));
        } else {
            setCoursePayload((prev) => ({
                ...prev,
                [key]: value,
            }));
            console.log(coursePayload);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleLessonPayloadChange = (index: number, key: keyof Lekcja, value: any) => {
        setCoursePayload((prev) => ({
            ...prev,
            lekcje: prev.lekcje?.map((lesson, i) => i === index ? { ...lesson, [key]: value } : lesson),
        }));
    };


    const [prowizjaCheckbox, setProwizjaCheckbox] = useState<boolean>(false);
    // Kategorie i firma
    const [categories, setCategories] = useState<Categories[]>([]);
    const [uniqueCategories, setUniqueCategories] = useState<Record<string, Categories[]>>({});
    const [selectedMainCategory, setSelectedMainCategory] =
        useState<string>("");
    const [selectedSubCategories, setSelectedSubCategories] = useState<
        string[]
    >([]);
    const [firmy, setFirmy] = useState<Firmy[]>([]);

    // Media - główne zdjęcie + galeria
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string>("");
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreview, setGalleryPreview] = useState<string[]>([]);

    // Sync coursePayload.kategoria with selectedSubCategories
    useEffect(() => {
        setCoursePayload((prev) => ({ ...prev, kategoria: selectedSubCategories }));
    }, [selectedSubCategories]);

    // Sync coursePayload.lekcje length with liczbaLekcji
    useEffect(() => {
        const n = coursePayload.liczbaLekcji ?? 0;
        if (n <= 0) {
            setCoursePayload((prev) => ({ ...prev, lekcje: [] }));
            return;
        }
        setCoursePayload((prev) => {
            const curr = prev.lekcje ?? [];
            if (curr.length === n) return prev;
            if (curr.length > n) return { ...prev, lekcje: curr.slice(0, n) };
            const next = [...curr];
            while (next.length < n) {
                next.push({ tytul: "", opis: "", dlugosc: "" });
            }
            return { ...prev, lekcje: next };
        });
    }, [coursePayload.liczbaLekcji]);
    
    useEffect(() => {
        if (coursePayload.nazwa) {
            setCoursePayload((prev) => ({
                ...prev,
                slug: generateSlug(prev.nazwa),
            }));
        }
    }, [coursePayload.nazwa]);

    // Pobierz kategorie
    useEffect(() => {
        async function fetchCategories() {
            try {
                const p1 = fetch("/admin/api/v1/category", {
                    method: "GET",
                    credentials: "include",
                }).then((data) => data.json());
                const p2 = fetch("/admin/api/v1/firmy", {
                    method: "GET",
                    credentials: "include",
                }).then((data) => data.json());
                await Promise.all([p1, p2]).then(([a, b]) => {
                    if (a.status == 0) {
                        const cat = JSON.parse(a.categories);
                        setCategories(cat);
                        setUniqueCategories(cat.reduce((acc: Record<string, Categories[]>, cat: Categories) => {
                            (acc[cat.kategoria] ??= []).push(cat);
                            return acc;
                        }, {}));
                    }
                    if (b.status == 0) {
                        setFirmy(b.firmy);
                    }
                });
            } catch (error) {
                console.error("Błąd podczas pobierania danych:", error);
            }
        }
        fetchCategories();
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

    const selectedFirm = useMemo(() => {
        return firmy.find((f) => f._id!.toString() === coursePayload.firma)?.instruktorzy ?? [];
    }, [coursePayload.firma, firmy]);

    // Wysyłanie szkolenia
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Przygotuj kategorie
            const selectedCategories: (string | Categories)[] = [];
            if (selectedMainCategory && uniqueCategories[selectedMainCategory]) {
                uniqueCategories[selectedMainCategory].forEach((cat) => {
                    if (selectedSubCategories.includes(cat._id || "")) {
                        selectedCategories.push(cat);
                    }
                });
            }

            // Przygotuj firmę (przy "inna" backend nie przyjmuje null – wymagamy firmy z listy)
            if (!coursePayload.firma || coursePayload.firma === "inna") {
                alert("Wybierz firmę z listy (opcja «inna» nie jest jeszcze obsługiwana przy zapisie).");
                setIsSubmitting(false);
                return;
            }
            const firmaData = firmy.find((f) => f._id!.toString() === coursePayload.firma);
            if (!firmaData) {
                alert("Wybierz firmę");
                setIsSubmitting(false);
                return;
            }

            // Upload zdjęć do blob i zbierz ścieżki (downloadUrl)
            const uploadFile = async (file: File, parent: string): Promise<string> => {
                const res = await fetch("/admin/api/v1/upload", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "X-File-Name": encodeURIComponent(file.name),
                        "X-File-Parent": encodeURIComponent(parent),
                    },
                    body: file,
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || "Błąd uploadu");
                }
                const data = await res.json();
                const url = data?.image?.url ?? null;
                if (!url) throw new Error("Brak URL w odpowiedzi uploadu");
                return url;
            };

            const mediaData: Media[] = [];
            const parentFolder = `courses/${coursePayload.slug}`;

            if (mainImageFile) {
                const path = await uploadFile(mainImageFile, parentFolder);
                mediaData.push({
                    nazwa: coursePayload.nazwa || mainImageFile.name,
                    slug: generateSlug(coursePayload.nazwa || mainImageFile.name),
                    typ: "image",
                    alt: coursePayload.nazwa || "Główne zdjęcie szkolenia",
                    path,
                });
            }
            for (const file of galleryFiles) {
                const path = await uploadFile(file, parentFolder);
                mediaData.push({
                    nazwa: file.name,
                    slug: generateSlug(file.name),
                    typ: "image",
                    alt: file.name,
                    path,
                });
            }

            const courseData = {
                ...coursePayload,
                kategoria: selectedSubCategories,
                firma: firmaData._id ?? coursePayload.firma,
                instruktor: coursePayload.instruktor || undefined,
                lekcje: coursePayload.lekcje ?? [],
                media: mediaData.length > 0 ? mediaData : coursePayload.media,
                czegoSieNauczysz: coursePayload.czegoSieNauczysz ?? [],
                wymagania: coursePayload.wymagania ?? [],
                gwarancjaDni: coursePayload.gwarancjaDni ?? 0,
                dozywotniDostep: coursePayload.dozywotniDostep ?? true,
                materialyDoPobrania: coursePayload.materialyDoPobrania ?? true,
                zawartoscKursu: coursePayload.zawartoscKursu ?? [],
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
                alert(
                    "Błąd podczas dodawania szkolenia: " +
                    (result.error || "Nieznany błąd"),
                );
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
                                value={coursePayload.nazwa}
                                onChange={(e) => handleCoursePayloadChange("nazwa", e.target.value)}
                                required
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="Np. Kompleksowy kurs strzyżenia męskiego"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Slug: {coursePayload.slug || "(auto-generowany z tytułu)"}
                            </p>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium mb-2">
                                Krótki opis (subtitle) *
                            </label>
                            <input
                                type="text"
                                value={coursePayload.krotkiOpis}
                                onChange={(e) => handleCoursePayloadChange("krotkiOpis", e.target.value)}
                                required
                                maxLength={120}
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="Krótkie podsumowanie szkolenia (max 120 znaków)"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                {coursePayload.krotkiOpis?.length}/120 znaków
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
                                value={coursePayload.cena}
                                onChange={(e) =>
                                    handleCoursePayloadChange("cena", parseFloat(e.target.value) || 0)
                                }
                                required
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="0.00"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Cena z VAT: {finalPrice(coursePayload.cena, coursePayload.vat, undefined, undefined)} zł</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                VAT (%)
                            </label>
                            <input
                                type="number"
                                max="100"
                                value={coursePayload.vat}
                                onChange={(e) =>
                                    handleCoursePayloadChange("vat", parseFloat(e.target.value) || 23)
                                }
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>

                </div>

                {/* Sekcja 2: Szkolenia */}
                <div className="rounded-lg border p-6 space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Szkolenia
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Czas trwania *
                            </label>
                            <input
                                type="text"
                                value={coursePayload.czasTrwania || ""}
                                onChange={(e) => handleCoursePayloadChange("czasTrwania", e.target.value)}
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
                                value={coursePayload.poziom || ""}
                                onChange={(e) => handleCoursePayloadChange("poziom", e.target.value)}
                                required
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring">
                                <option value="poczatkujacy">
                                    Początkujący
                                </option>
                                <option value="sredniozaawansowany">
                                    Średniozaawansowany
                                </option>
                                <option value="zaawansowany">
                                    Zaawansowany
                                </option>
                                <option value="wszystkie">
                                    Wszystkie poziomy
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Liczba lekcji
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={coursePayload.liczbaLekcji || 0}
                                onChange={(e) =>
                                    handleCoursePayloadChange("liczbaLekcji", parseInt(e.target.value) || 0)
                                }
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Język
                            </label>
                            <select
                                value={coursePayload.jezyk || "polski"}
                                onChange={(e) => handleCoursePayloadChange("jezyk", e.target.value)}
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring">
                                <option value="polski">Polski</option>
                                <option value="angielski">Angielski</option>
                                <option value="niemiecki">Niemiecki</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 pt-6">
                            <input
                                type="checkbox"
                                checked={coursePayload.certyfikat || false}
                                onChange={(e) =>
                                    handleCoursePayloadChange("certyfikat", e.target.checked)
                                }
                                className="w-4 h-4"
                                id="certyfikat"
                            />
                            <label
                                htmlFor="certyfikat"
                                className="text-sm font-medium cursor-pointer">
                                Certyfikat ukończenia
                            </label>
                        </div>
                    </div>
                </div>

                {/* Sekcja 3: Szczegóły szkoleń */}
                {coursePayload.liczbaLekcji != null && coursePayload.liczbaLekcji > 0 && (
                    <div className="rounded-lg border p-6 space-y-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Szczegóły szkoleń
                        </h2>
                        {(coursePayload.lekcje ?? []).map((lekcja, index) => (
                            <div key={index} className="rounded-lg border p-4 space-y-4">
                                <h3 className="text-lg font-semibold">Lekcja #{index + 1}</h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium mb-2">Tytuł lekcji</label>
                                        <input
                                            type="text"
                                            value={lekcja.tytul}
                                            onChange={(e) => handleLessonPayloadChange(index, "tytul", e.target.value)}
                                            className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                            placeholder="Np. Wprowadzenie do kursu"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium mb-2">Opis lekcji</label>
                                        <textarea
                                            rows={2}
                                            value={lekcja.opis}
                                            onChange={(e) => handleLessonPayloadChange(index, "opis", e.target.value)}
                                            className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                            placeholder="Krótki opis lekcji"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Długość (np. 15:30 lub 45 min)</label>
                                        <input
                                            type="text"
                                            value={lekcja.dlugosc}
                                            onChange={(e) => handleLessonPayloadChange(index, "dlugosc", e.target.value)}
                                            className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                            placeholder="15:30"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Sekcja: Czego się nauczysz */}
                <div className="rounded-lg border p-6 space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Czego się nauczysz
                    </h2>
                    <p className="text-sm text-muted-foreground">Dodaj punkty wyświetlane na stronie kursu (dodaj/usuń).</p>
                    {(coursePayload.czegoSieNauczysz ?? []).map((punkt, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={punkt}
                                onChange={(e) => {
                                    const next = [...(coursePayload.czegoSieNauczysz ?? [])];
                                    next[index] = e.target.value;
                                    handleCoursePayloadChange("czegoSieNauczysz", next);
                                }}
                                className="flex-1 rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="Np. Profesjonalne techniki strzyżenia"
                            />
                            <button
                                type="button"
                                onClick={() => handleCoursePayloadChange("czegoSieNauczysz", (coursePayload.czegoSieNauczysz ?? []).filter((_, i) => i !== index))}
                                className="px-3 py-2 border rounded-md hover:bg-red-50 text-red-600"
                            >
                                Usuń
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => handleCoursePayloadChange("czegoSieNauczysz", [...(coursePayload.czegoSieNauczysz ?? []), ""])}
                        className="px-4 py-2 border rounded-md hover:bg-accent transition-colors text-sm"
                    >
                        + Dodaj punkt
                    </button>
                </div>

                {/* Sekcja: Wymagania */}
                <div className="rounded-lg border p-6 space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Wymagania
                    </h2>
                    <p className="text-sm text-muted-foreground">Dodaj wymagania wobec uczestnika (dodaj/usuń).</p>
                    {(coursePayload.wymagania ?? []).map((w, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={w}
                                onChange={(e) => {
                                    const next = [...(coursePayload.wymagania ?? [])];
                                    next[index] = e.target.value;
                                    handleCoursePayloadChange("wymagania", next);
                                }}
                                className="flex-1 rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="Np. Podstawowa znajomość narzędzi"
                            />
                            <button
                                type="button"
                                onClick={() => handleCoursePayloadChange("wymagania", (coursePayload.wymagania ?? []).filter((_, i) => i !== index))}
                                className="px-3 py-2 border rounded-md hover:bg-red-50 text-red-600"
                            >
                                Usuń
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => handleCoursePayloadChange("wymagania", [...(coursePayload.wymagania ?? []), ""])}
                        className="px-4 py-2 border rounded-md hover:bg-accent transition-colors text-sm"
                    >
                        + Dodaj wymaganie
                    </button>
                </div>

                {/* Opcjonalnie: Gwarancja i zawartość */}
                <div className="rounded-lg border p-6 space-y-6">
                    <h2 className="text-xl font-semibold">Gwarancja i zawartość kursu</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-2">Gwarancja (dni, 0 = brak)</label>
                            <input
                                type="number"
                                min={0}
                                value={coursePayload.gwarancjaDni ?? ""}
                                onChange={(e) => handleCoursePayloadChange("gwarancjaDni", e.target.value === "" ? undefined : parseInt(e.target.value, 10) || 0)}
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="30"
                            />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <input
                                type="checkbox"
                                checked={coursePayload.dozywotniDostep !== false}
                                onChange={(e) => handleCoursePayloadChange("dozywotniDostep", e.target.checked)}
                                className="w-4 h-4"
                                id="dozywotniDostep"
                            />
                            <label htmlFor="dozywotniDostep" className="text-sm font-medium cursor-pointer">Dożywotni dostęp</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={coursePayload.materialyDoPobrania !== false}
                                onChange={(e) => handleCoursePayloadChange("materialyDoPobrania", e.target.checked)}
                                className="w-4 h-4"
                                id="materialyDoPobrania"
                            />
                            <label htmlFor="materialyDoPobrania" className="text-sm font-medium cursor-pointer">Materiały do pobrania</label>
                        </div>
                    </div>
                    <div className="pt-4 border-t">
                        <label className="block text-sm font-medium mb-2">Zawartość kursu</label>
                        <p className="text-sm text-muted-foreground mb-2">Np. lekcje wideo, PDF, dostęp do grupy (dodaj/usuń).</p>
                        {(coursePayload.zawartoscKursu ?? []).map((punkt, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={punkt}
                                    onChange={(e) => {
                                        const next = [...(coursePayload.zawartoscKursu ?? [])];
                                        next[index] = e.target.value;
                                        handleCoursePayloadChange("zawartoscKursu", next);
                                    }}
                                    className="flex-1 rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                    placeholder="Np. 12 lekcji wideo, PDF (60 stron)"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleCoursePayloadChange("zawartoscKursu", (coursePayload.zawartoscKursu ?? []).filter((_, i) => i !== index))}
                                    className="px-3 py-2 border rounded-md hover:bg-red-50 text-red-600"
                                >
                                    Usuń
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => handleCoursePayloadChange("zawartoscKursu", [...(coursePayload.zawartoscKursu ?? []), ""])}
                            className="px-4 py-2 border rounded-md hover:bg-accent transition-colors text-sm"
                        >
                            + Dodaj pozycję zawartości
                        </button>
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
                            value={coursePayload.opis || ""}
                            onChange={(e) => handleCoursePayloadChange("opis", e.target.value)}
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
                                    value={selectedMainCategory || ""}
                                    onChange={(e) => {
                                        handleMainCategoryChange(e.target.value)
                                    }}
                                    required
                                    className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring">
                                    <option value="">
                                        Wybierz główną kategorię
                                    </option>
                                    {Object.keys(uniqueCategories).map((key: string) => (
                                        <option key={key} value={key}>
                                            {key}
                                        </option>
                                    ))}
                                </select>
                                {selectedMainCategory &&
                                    uniqueCategories[selectedMainCategory] && (
                                        <div className="space-y-2 mt-2">
                                            <label className="text-xs text-muted-foreground">
                                                Wybierz podkategorie (wiele):
                                            </label>
                                            {uniqueCategories[
                                                selectedMainCategory
                                            ].map((cat) => (
                                                <label
                                                    key={cat._id || cat.nazwa}
                                                    className="flex items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-accent">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSubCategories.includes(
                                                            cat._id || "",
                                                        )}
                                                        onChange={() => {
                                                            handleSubCategoryToggle(
                                                                cat._id || "",
                                                            );
                                                        }}
                                                        className="w-4 h-4"
                                                    />
                                                    <span className="text-sm">
                                                        {cat.nazwa}
                                                    </span>
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
                                value={coursePayload.firma as string || ""}
                                onChange={(e) =>
                                    handleCoursePayloadChange("firma", e.target.value)
                                }
                                required
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring">
                                <option value="">Wybierz firmę</option>
                                <option value="inna">Instruktor nieskojarzony z firmą</option>
                                {firmy.map((firma) => (
                                    <option
                                        key={firma.nazwa}
                                        value={firma._id}>
                                        {firma.nazwa}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {coursePayload.firma && coursePayload.firma !== "" && (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Instruktor
                                </label>
                                {coursePayload.firma && coursePayload.firma !== "inna" &&
                                    <select
                                        value={coursePayload.instruktor || ""}
                                        onChange={(e) => handleCoursePayloadChange("instruktor", e.target.value)}
                                        className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring">
                                        <option value="">Wybierz instruktora</option>
                                        {selectedFirm.map((instruktor) => (
                                            <option key={(instruktor as User)._id || ""} value={`${(instruktor as User).imie} ${(instruktor as User).nazwisko}`}>
                                                {(instruktor as User).imie} {(instruktor as User).nazwisko}
                                            </option>
                                        ))}
                                    </select>}
                                {coursePayload.firma && coursePayload.firma === "inna" && (
                                    <input type="text" placeholder="np. Jan Kowalski" value={coursePayload.instruktor || ""} onChange={(e) => handleCoursePayloadChange("instruktor", e.target.value)} className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring" />
                                )}
                                {coursePayload.instruktor && coursePayload.instruktor !== "" && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <input type="checkbox"
                                            checked={prowizjaCheckbox}
                                            onChange={() => setProwizjaCheckbox(prev => !prev)}
                                        ></input>
                                        <label
                                            onClick={() => setProwizjaCheckbox(prev => !prev)}
                                            htmlFor="prowizjaCheckbox"
                                            className="text-sm font-medium cursor-pointer">
                                            Dla tego kursu powinna być wyliczona inna prowizja
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}
                        {prowizjaCheckbox && (
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div>
                                    <label title="Prowizja - kwota, którą otrzyma instruktor za sprzedaż szkolenia" className="block text-sm font-medium mb-2">
                                        Prowizja * <Info className="h-4 w-4 inline-block ml-2" />
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={coursePayload.prowizja || 0}
                                        onChange={(e) =>
                                            handleCoursePayloadChange("prowizja", parseFloat(e.target.value) || 0)
                                        }
                                        required
                                        className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                        placeholder="0.00"
                                    />
                                    {coursePayload.prowizja_typ === "procent" && <p className="text-xs text-muted-foreground mt-1">Kwota wyliczona na podstawie ceny szkolenia {coursePayload.cena && (coursePayload.cena * (coursePayload.prowizja! / 100)).toFixed(2)} zł</p>}
                                </div>

                                <div>
                                    <label title="Typ prowizji - procent lub kwota, podana w umowie z instruktorem" className="block text-sm font-medium mb-2">
                                        Typ prowizji <Info className="h-4 w-4 inline-block ml-2" />
                                    </label>
                                    <select
                                        value={coursePayload.prowizja_typ || "procent"}
                                        onChange={(e) =>
                                            handleCoursePayloadChange("prowizja_typ", e.target.value as "procent" | "kwota")
                                        }
                                        className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring">
                                        <option value="procent">Procent</option>
                                        <option value="kwota">Kwota</option>
                                    </select>
                                </div>
                                <div>
                                    <label title="VAT prowizji - brutto lub netto, podana w umowie z instruktorem" className="block text-sm font-medium mb-2">
                                        VAT prowizji <Info className="h-4 w-4 inline-block ml-2" />
                                    </label>
                                    <select
                                        value={coursePayload.prowizja_vat || "brutto"}
                                        onChange={(e) =>
                                            handleCoursePayloadChange("prowizja_vat", e.target.value as "brutto" | "netto")
                                        }
                                        className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring">
                                        <option value="brutto">Brutto</option>
                                        <option value="netto">Netto</option>
                                    </select>
                                </div>
                            </div>
                        )}
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
                                                onClick={() =>
                                                    removeGalleryImage(index)
                                                }
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
                            checked={coursePayload.aktywne || false}
                            onChange={(e) => handleCoursePayloadChange("aktywne", e.target.checked)}
                            className="w-4 h-4"
                            id="aktywne"
                        />
                        <label
                            htmlFor="aktywne"
                            className="text-sm font-medium cursor-pointer">
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
            </form >
        </div >

    );
}
