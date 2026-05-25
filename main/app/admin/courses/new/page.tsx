"use client";

import { useState, useEffect, useMemo } from "react";
import "@/app/globals2.css";
import { Courses, Firmy } from "@/lib/types/coursesTypes";
import { Categories, Media } from "@/lib/types/shared";
import { useRouter } from "next/navigation";
import { X, Clock, Users, BookOpen, Award, Info } from "lucide-react";
import { Users as User, userSchema } from "@/lib/types/userTypes";
import { CenaTyp } from "@/lib/admin/pricing";
import AdminPriceVatFields from "@/components/admin/AdminPriceVatFields";
import { generateSlug } from "@/lib/utils_admin";
import { useCategoryTree } from "@/components/admin/hooks/useCategoryTree";
import AdminCategoryPicker from "@/components/admin/AdminCategoryPicker";
import CourseLessonsEditor from "@/components/admin/CourseLessonsEditor";
import {
    AdminFormSection,
    adminFormPageGrid,
    adminFormSpanFull,
} from "@/components/admin/AdminFormLayout";


function calculateProwizja(cena: number, prowizja: number, prowizja_typ: string, vat: number): number {
    if (prowizja_typ === "procent") {
        return (cena * (prowizja / 100)) + ((cena * (prowizja / 100)) * vat / 100);
    } else {
        return prowizja + (prowizja * vat / 100);
    }
}


export default function NewCoursePage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
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
        godzina_rozpoczecia: undefined,
        godzina_zakonczenia: undefined,
        data_rozpoczecia: undefined,
        adres: undefined,
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
        max_uczestnicy: undefined,
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
        }
    };

    const [prowizjaCheckbox, setProwizjaCheckbox] = useState<boolean>(false);
    const categoryTree = useCategoryTree();
    const [firmy, setFirmy] = useState<Firmy[]>([]);

    // Media - główne zdjęcie + galeria
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string>("");
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreview, setGalleryPreview] = useState<string[]>([]);
    const [cenaTyp, setCenaTyp] = useState<CenaTyp>("brutto");

    useEffect(() => {
        setCoursePayload((prev) => ({
            ...prev,
            kategoria: categoryTree.getSelectedCategoryIds(),
        }));
    }, [categoryTree.selectedSubCategories, categoryTree.selectedMainCategory]);

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

    useEffect(() => {
        async function fetchFirmy() {
            try {
                const res = await fetch("/admin/api/v1/firmy", {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                if (data.status == 0) setFirmy(data.firmy);
            } catch (error) {
                console.error("Błąd podczas pobierania firm:", error);
            }
        }
        fetchFirmy();
    }, []);

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
            const selectedCategories = categoryTree
                .getSelectedCategoryIds()
                .map((id) =>
                    Object.values(categoryTree.categories)
                        .flat()
                        .find((c) => c._id === id),
                )
                .filter(Boolean) as Categories[];

            const firmaData = firmy.find((f) => f._id!.toString() === coursePayload.firma);
            if (!firmaData && coursePayload.firma !== "inna") {
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

            const price = coursePayload.cena;

            const courseData = {
                ...coursePayload,
                kategoria: selectedCategories,
                firma: firmaData ? firmaData._id : null,
                cena: price,
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
                setError(result.details || "Nieznany błąd");
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
            {error &&
                <div className="rounded-lg border p-6 space-y-6 bg-red-50">
                    <div className="text-center">
                        <div className="text-6xl">❌</div>
                        <h2 className="text-2xl font-bold mb-2">Błąd</h2>
                        <p className="text-muted-foreground mb-4 text-red-500">{error.toString()}</p>
                    </div>
                </div>
            }
            <form onSubmit={handleSubmit} className={adminFormPageGrid}>
                <AdminFormSection title="Podstawowe informacje" icon={BookOpen}>
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
                                value={coursePayload.krotkiOpis ?? ""}
                                onChange={(e) => handleCoursePayloadChange("krotkiOpis", e.target.value)}
                                required
                                maxLength={120}
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="Krótkie podsumowanie szkolenia (max 120 znaków)"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                {coursePayload.krotkiOpis?.length ?? 0}/120 znaków
                            </p>
                        </div>

                        <AdminPriceVatFields
                            label="Cena *"
                            required
                            storedNetValue={coursePayload.cena}
                            vatPercent={coursePayload.vat}
                            cenaTyp={cenaTyp}
                            onStoredNetChange={(v) => handleCoursePayloadChange("cena", v)}
                            onCenaTypChange={setCenaTyp}
                        />

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

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                SKU
                            </label>
                            <input
                                type="text"
                                value={coursePayload.sku ?? ""}
                                onChange={(e) =>
                                    handleCoursePayloadChange("sku", e.target.value || null)
                                }
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="Np. KURS-001"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Ocena (0–5)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                value={coursePayload.ocena ?? ""}
                                onChange={(e) =>
                                    handleCoursePayloadChange("ocena", parseFloat(e.target.value) || 0)
                                }
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </AdminFormSection>

                <AdminFormSection title="Parametry szkolenia" icon={Clock}>
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
                                Maks. uczestników (maks. zakupów)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={coursePayload.max_uczestnicy ?? ""}
                                onChange={(e) =>
                                    handleCoursePayloadChange("max_uczestnicy", e.target.value === "" ? undefined : Math.max(1, parseInt(e.target.value, 10) || 1))
                                }
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="Bez limitu"
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
                </AdminFormSection>

                {coursePayload.liczbaLekcji != null && coursePayload.liczbaLekcji > 0 && (
                    <AdminFormSection
                        title="Szczegóły lekcji"
                        icon={Clock}
                        className={adminFormSpanFull}>
                        <CourseLessonsEditor
                            liczbaLekcji={coursePayload.liczbaLekcji}
                            lekcje={coursePayload.lekcje ?? []}
                            onLiczbaLekcjiChange={(n) =>
                                handleCoursePayloadChange("liczbaLekcji", n)
                            }
                            onLekcjeChange={(lekcje) =>
                                handleCoursePayloadChange("lekcje", lekcje)
                            }
                            showLiczbaInput={false}
                        />
                    </AdminFormSection>
                )}

                <AdminFormSection title="Czego się nauczysz" icon={Award}>
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
                </AdminFormSection>

                <AdminFormSection title="Wymagania" icon={Info}>
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
                </AdminFormSection>

                <AdminFormSection title="Gwarancja i zawartość">
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
                </AdminFormSection>

                <AdminFormSection title="Daty i miejsce" icon={Clock}>
                    <p className="text-sm text-muted-foreground">Opcjonalnie dla szkoleń stacjonarnych / z ustalonym terminem.</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-2">Godzina rozpoczęcia</label>
                            <input
                                type="text"
                                value={coursePayload.godzina_rozpoczecia ?? ""}
                                onChange={(e) => handleCoursePayloadChange("godzina_rozpoczecia", e.target.value || undefined)}
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="np. 09:00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Godzina zakończenia</label>
                            <input
                                type="text"
                                value={coursePayload.godzina_zakonczenia ?? ""}
                                onChange={(e) => handleCoursePayloadChange("godzina_zakonczenia", e.target.value || undefined)}
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="np. 17:00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Data rozpoczęcia</label>
                            <input
                                type="datetime-local"
                                value={coursePayload.data_rozpoczecia ? new Date(coursePayload.data_rozpoczecia).toISOString().slice(0, 16) : ""}
                                onChange={(e) =>
                                    handleCoursePayloadChange("data_rozpoczecia", e.target.value ? new Date(e.target.value) : undefined)
                                }
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium mb-2">Adres</label>
                            <input
                                type="text"
                                value={coursePayload.adres ?? ""}
                                onChange={(e) => handleCoursePayloadChange("adres", e.target.value || undefined)}
                                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="Adres szkolenia"
                            />
                        </div>
                    </div>
                </AdminFormSection>

                <AdminFormSection
                    title="Opis szkolenia"
                    icon={BookOpen}
                    className={adminFormSpanFull}>
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
                </AdminFormSection>

                <AdminFormSection title="Kategorie i organizator" icon={Users}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Kategorie *
                            </label>
                            <AdminCategoryPicker
                                categories={categoryTree.categories}
                                categoriesSlug={categoryTree.categoriesSlug}
                                selectedMainCategory={
                                    categoryTree.selectedMainCategory
                                }
                                selectedSubCategories={
                                    categoryTree.selectedSubCategories
                                }
                                onMainCategoryChange={
                                    categoryTree.handleMainCategoryChange
                                }
                                onSubCategoryToggle={
                                    categoryTree.handleSubCategoryToggle
                                }
                                required
                            />
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
                </AdminFormSection>

                <AdminFormSection
                    title="Zdjęcia szkolenia"
                    className={adminFormSpanFull}>
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
                </AdminFormSection>

                <AdminFormSection title="Publikacja" className={adminFormSpanFull}>
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
                </AdminFormSection>

                <div className={`flex justify-end gap-4 ${adminFormSpanFull}`}>
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
