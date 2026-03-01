"use client";

import { useState, useEffect, useMemo } from "react";
import { Courses, Firmy, Lekcja } from "@/lib/types/coursesTypes";
import { Categories, Media } from "@/lib/types/shared";
import { Save, Trash2, Plus, Minus, Copy, BookOpen, Clock, Award, Info, Users } from "lucide-react";
import { parseSlugName, generateSlug } from "@/lib/utils_admin";
import { randomBytes } from "crypto";
import { useRouter } from "next/navigation";
import { finalPrice } from "@/lib/utils";
import { Users as User } from "@/lib/types/userTypes";

interface CourseEditModalProps {
    course: Courses;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (course: Courses) => void;
    onDelete: (courseSlug: string) => void;
}

export default function CourseEditModal({
    course,
    isOpen: _isOpen,
    onClose,
    onUpdate,
    onDelete,
}: CourseEditModalProps) {
    const router = useRouter();
    const [editedCourse, setEditedCourse] = useState<Courses>(course);
    const [isSaving, setIsSaving] = useState(false);
    const [prowizjaCheckbox, setProwizjaCheckbox] = useState(false);

    // Kategorie i firma z API
    const [categories, setCategories] = useState<Record<string, Categories[]>>(
        {},
    );
    const [categoriesSlug, setCategoriesSlug] = useState<string[]>([]);
    const [firmy, setFirmy] = useState<Firmy[]>([]);

    // Wybrane kategorie (główna + podrzędne)
    const [selectedMainCategory, setSelectedMainCategory] =
        useState<string>("");
    const [selectedSubCategories, setSelectedSubCategories] = useState<
        string[]
    >([]);
    const [selectedFirma, setSelectedFirma] = useState<string>("");

    const FIRMA_INNA = "inna"; // Instruktor nieskojarzony z firmą

    useEffect(() => {
        // Konwertuj wartości 0 na undefined dla pól numerycznych; instruktor z bazy jest w course
        const normalizedCourse = {
            ...course,
            cena: course.cena || 0,
            ocena: course.ocena || 0,
        };
        setEditedCourse(normalizedCourse);
    }, [course]);

    // Auto-generuj slug z nazwy
    useEffect(() => {
        if (editedCourse.nazwa && !editedCourse.slug) {
            setEditedCourse((prev) => ({
                ...prev,
                slug: generateSlug(prev.nazwa),
            }));
        }
    }, [editedCourse.nazwa]);

    // Sync liczbaLekcji z tablicą lekcje (jak na stronie new)
    useEffect(() => {
        const n = editedCourse.liczbaLekcji ?? 0;
        if (n <= 0) {
            setEditedCourse((prev) => ({ ...prev, lekcje: [] }));
            return;
        }
        setEditedCourse((prev) => {
            const curr = prev.lekcje ?? [];
            if (curr.length === n) return prev;
            if (curr.length > n) return { ...prev, lekcje: curr.slice(0, n) };
            const next = [...curr];
            while (next.length < n) {
                next.push({ tytul: "", opis: "", dlugosc: "" });
            }
            return { ...prev, lekcje: next };
        });
    }, [editedCourse.liczbaLekcji]);

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
                    const raw = data.categories;
                    const catList: Categories[] = typeof raw === "string" ? JSON.parse(raw) : Array.isArray(raw) ? raw : [];
                    const byKategoria = catList.reduce<Record<string, Categories[]>>((acc, c) => {
                        const k = (c as Categories & { kategoria?: string }).kategoria ?? "";
                        (acc[k] ??= []).push(c);
                        return acc;
                    }, {});
                    setCategories(byKategoria);
                    setCategoriesSlug(Object.keys(byKategoria));

                    // Ustaw wybrane kategorie na podstawie kursu
                    const courseCategories = getCategories();
                    if (courseCategories.length > 0) {
                        const firstCat = courseCategories[0];
                        const mainKey = (firstCat as Categories & { kategoria?: string }).kategoria ?? firstCat.nazwa ?? "";
                        setSelectedMainCategory(mainKey);
                        setSelectedSubCategories(
                            courseCategories
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

    // Pobierz firmy
    useEffect(() => {
        async function fetchFirmy() {
            try {
                const response = await fetch("/admin/api/v1/firmy", {
                    method: "GET",
                    credentials: "include",
                });
                const data = await response.json();
                setFirmy(data.firmy ?? []);
            } catch (error) {
                console.error("Błąd podczas pobierania firm:", error);
            }
        }
        fetchFirmy();
    }, []);

    // Sync selectedFirma z course z bazy: gdy firma === null → "Instruktor nieskojarzony z firmą", instruktor z obiektu
    useEffect(() => {
        const courseFirma = course.firma ?? null;
        if (!courseFirma) {
            setSelectedFirma(FIRMA_INNA);
        } else if (
            typeof courseFirma === "object" &&
            courseFirma !== null &&
            "_id" in courseFirma
        ) {
            const slug = (courseFirma as Firmy).slug;
            if (slug) {
                setSelectedFirma(slug);
            } else if (firmy.length > 0) {
                const found = firmy.find(
                    (f) => f._id === (courseFirma as Firmy)._id
                );
                if (found?.slug) setSelectedFirma(found.slug);
            }
        }
    }, [course, firmy]);

    const getCategories = (): Categories[] => {
        if (!editedCourse.kategoria) return [];
        if (Array.isArray(editedCourse.kategoria)) {
            return editedCourse.kategoria.filter(
                (cat): cat is Categories =>
                    typeof cat === "object" && cat !== null && "nazwa" in cat,
            ) as Categories[];
        }
        return [];
    };

    const handleSave = async () => {
        setIsSaving(true);
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
            editedCourse.kategoria = selectedCategories;

            // Przygotuj firmę
            if (selectedFirma === FIRMA_INNA) {
                editedCourse.firma = null;
            } else {
                const firmaData = firmy.find((f) => f.slug === selectedFirma);
                if (firmaData) {
                    editedCourse.firma = firmaData._id || firmaData;
                }
            }

            const response = await fetch("/admin/api/v1/courses", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(editedCourse),
            });

            const result = await response.json();
            if (result.status === 0 || response.ok) {
                onUpdate(editedCourse);
            } else {
                alert(
                    "Błąd podczas zapisywania: " +
                    (result.error || "Nieznany błąd"),
                );
            }
        } catch (error) {
            console.error("Błąd podczas zapisywania kursu:", error);
            alert("Błąd podczas zapisywania kursu. Sprawdź konsolę.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Czy na pewno chcesz usunąć ten kurs?")) return;

        try {
            const response = await fetch(
                `/admin/api/v1/courses?slug=${editedCourse.slug}`,
                {
                    method: "DELETE",
                    credentials: "include",
                },
            );

            const result = await response.json();
            if (result.status === 0 || response.ok) {
                onDelete(editedCourse.slug);
            } else {
                alert(
                    "Błąd podczas usuwania kursu: " +
                    (result.error || "Nieznany błąd"),
                );
            }
        } catch (error) {
            console.error("Błąd podczas usuwania kursu:", error);
            alert("Błąd podczas usuwania kursu. Sprawdź konsolę.");
        }
    };

    const updateField = <K extends keyof Courses>(
        field: K,
        value: Courses[K],
    ) => {
        setEditedCourse((prev) => ({ ...prev, [field]: value }));
    };

    const handleMainCategoryChange = (mainSlug: string) => {
        setSelectedMainCategory(mainSlug);
        setSelectedSubCategories([]);
        if (categories[mainSlug]) {
            updateField("kategoria", categories[mainSlug]);
        }
    };

    const handleDuplicate = async () => {
        const duplicateCourse = {
            ...editedCourse,
            slug: generateSlug(editedCourse.nazwa + "_" + randomBytes(2 ** 3).toString("hex")),
        };
        const response = await fetch("/admin/api/v1/courses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(duplicateCourse),
        });
        const result = await response.json();
        if (result.status === 0 || response.ok) {
            router.push("/admin/courses");
        } else {
            alert(
                "Błąd podczas duplikowania kursu: " +
                (result.error || "Nieznany błąd"),
            );
        }
    };

    const handleSubCategoryToggle = (subCategoryId: string) => {
        setSelectedSubCategories((prev) => {
            const newSelected = prev.includes(subCategoryId)
                ? prev.filter((id) => id !== subCategoryId)
                : [...prev, subCategoryId];

            if (selectedMainCategory && categories[selectedMainCategory]) {
                const selectedCats = categories[selectedMainCategory].filter(
                    (cat) => newSelected.includes(cat._id || ""),
                );
                updateField("kategoria", selectedCats);
            }

            return newSelected;
        });
    };

    const handleFirmaChange = (firmaId: string) => {
        setSelectedFirma(firmaId);
        if (firmaId === FIRMA_INNA) {
            updateField("firma", null);
        } else {
            const firmaData = firmy.find((f) => f.slug === firmaId);
            if (firmaData) {
                updateField("firma", firmaData._id || firmaData);
            }
        }
    };

    const selectedFirm = useMemo(() => {
        const f = firmy.find((firma) => firma.slug === selectedFirma);
        return (f?.instruktorzy ?? []) as User[];
    }, [selectedFirma, firmy]);

    const addMedia = () => {
        const media = editedCourse.media || [];
        updateField("media", [
            ...media,
            { nazwa: "", slug: "", typ: "image", alt: "", path: "" },
        ]);
    };

    const updateMedia = (index: number, field: keyof Media, value: string) => {
        const media = [...(editedCourse.media || [])];
        if (media[index]) {
            media[index] = { ...media[index], [field]: value };
            updateField("media", media);
        }
    };

    const handleLessonChange = (index: number, key: keyof Lekcja, value: string) => {
        setEditedCourse((prev) => ({
            ...prev,
            lekcje: (prev.lekcje ?? []).map((lesson, i) =>
                i === index ? { ...lesson, [key]: value } : lesson
            ),
        }));
    };

    const removeMedia = (index: number) => {
        const media = editedCourse.media || [];
        updateField(
            "media",
            media.filter((_, i) => i !== index),
        );
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Edytuj szkolenie
                </h1>
                <p className="text-sm text-muted-foreground sm:text-base mt-2">
                    Zmień dane szkolenia i zapisz zmiany.
                </p>
            </div>

            <div className="space-y-6 sm:space-y-8">
                    {/* Sekcja 1: Podstawowe informacje */}
                    <div className="rounded-lg border p-6 space-y-6">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Podstawowe informacje
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium mb-1">Nazwa szkolenia *</label>
                                <input
                                    type="text"
                                    value={editedCourse.nazwa || ""}
                                    onChange={(e) => updateField("nazwa", e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Slug: {editedCourse.slug || "(auto)"}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium mb-1">Krótki opis (subtitle)</label>
                                <input
                                    type="text"
                                    value={editedCourse.krotkiOpis || ""}
                                    onChange={(e) => updateField("krotkiOpis", e.target.value)}
                                    maxLength={120}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="Max 120 znaków"
                                />
                                <p className="text-xs text-muted-foreground mt-1">{editedCourse.krotkiOpis?.length ?? 0}/120</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Cena (bez VAT) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editedCourse.cena !== 0 ? editedCourse.cena : ""}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        updateField("cena", val === "" ? 0 : parseFloat(val) || 0);
                                    }}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="0.00"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Cena z VAT: {finalPrice(editedCourse.cena || 0, editedCourse.vat ?? 23, undefined, undefined)} zł</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">VAT (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={editedCourse.vat ?? ""}
                                    onChange={(e) => updateField("vat", e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="23"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">SKU</label>
                                <input
                                    type="text"
                                    value={editedCourse.sku ?? ""}
                                    onChange={(e) => updateField("sku", e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Ocena (0–5)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="5"
                                    value={editedCourse.ocena ?? ""}
                                    onChange={(e) => updateField("ocena", e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sekcja 2: Szkolenia */}
                    <div className="rounded-lg border p-6 space-y-6">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Szkolenia
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Czas trwania</label>
                                <input
                                    type="text"
                                    value={editedCourse.czasTrwania || ""}
                                    onChange={(e) => updateField("czasTrwania", e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="Np. 10 godzin"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Poziom</label>
                                <select
                                    value={editedCourse.poziom || ""}
                                    onChange={(e) => updateField("poziom", e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md">
                                    <option value="">—</option>
                                    <option value="poczatkujacy">Początkujący</option>
                                    <option value="sredniozaawansowany">Średniozaawansowany</option>
                                    <option value="zaawansowany">Zaawansowany</option>
                                    <option value="wszystkie">Wszystkie poziomy</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Liczba lekcji</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editedCourse.liczbaLekcji ?? ""}
                                    onChange={(e) => updateField("liczbaLekcji", e.target.value === "" ? undefined : parseInt(e.target.value, 10) || 0)}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Maks. uczestników</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={editedCourse.max_uczestnicy ?? ""}
                                    onChange={(e) => updateField("max_uczestnicy", e.target.value === "" ? undefined : Math.max(1, parseInt(e.target.value, 10) || 1))}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="Bez limitu"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Język</label>
                                <select
                                    value={editedCourse.jezyk || "polski"}
                                    onChange={(e) => updateField("jezyk", e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md">
                                    <option value="polski">Polski</option>
                                    <option value="angielski">Angielski</option>
                                    <option value="niemiecki">Niemiecki</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="certyfikat-edit"
                                    checked={editedCourse.certyfikat === true}
                                    onChange={(e) => updateField("certyfikat", e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="certyfikat-edit" className="text-sm font-medium">Certyfikat ukończenia</label>
                            </div>
                        </div>
                    </div>

                    {/* Szczegóły lekcji */}
                    {(editedCourse.lekcje?.length ?? 0) > 0 && (
                        <div className="rounded-lg border p-6 space-y-6">
                            <h3 className="text-xl font-semibold flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Szczegóły lekcji
                            </h3>
                            {(editedCourse.lekcje ?? []).map((lekcja, index) => (
                                <div key={index} className="rounded-lg border p-4 space-y-4">
                                    <h4 className="font-medium">Lekcja #{index + 1}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium mb-1">Tytuł lekcji</label>
                                            <input
                                                type="text"
                                                value={lekcja.tytul}
                                                onChange={(e) => handleLessonChange(index, "tytul", e.target.value)}
                                                className="w-full px-3 py-2 border rounded-md"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium mb-1">Opis lekcji</label>
                                            <textarea
                                                rows={2}
                                                value={lekcja.opis}
                                                onChange={(e) => handleLessonChange(index, "opis", e.target.value)}
                                                className="w-full px-3 py-2 border rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Długość</label>
                                            <input
                                                type="text"
                                                value={lekcja.dlugosc}
                                                onChange={(e) => handleLessonChange(index, "dlugosc", e.target.value)}
                                                className="w-full px-3 py-2 border rounded-md"
                                                placeholder="np. 15:30"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Czego się nauczysz */}
                    <div className="rounded-lg border p-6 space-y-6">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Czego się nauczysz
                        </h3>
                        {(editedCourse.czegoSieNauczysz ?? []).map((punkt, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={punkt}
                                    onChange={(e) => {
                                        const next = [...(editedCourse.czegoSieNauczysz ?? [])];
                                        next[index] = e.target.value;
                                        updateField("czegoSieNauczysz", next);
                                    }}
                                    className="flex-1 px-3 py-2 border rounded-md"
                                    placeholder="Np. Techniki strzyżenia"
                                />
                                <button
                                    type="button"
                                    onClick={() => updateField("czegoSieNauczysz", (editedCourse.czegoSieNauczysz ?? []).filter((_, i) => i !== index))}
                                    className="px-3 py-2 border rounded-md hover:bg-red-50 text-red-600"
                                >
                                    Usuń
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => updateField("czegoSieNauczysz", [...(editedCourse.czegoSieNauczysz ?? []), ""])}
                            className="px-4 py-2 border rounded-md hover:bg-accent text-sm"
                        >
                            + Dodaj punkt
                        </button>
                    </div>

                    {/* Wymagania */}
                    <div className="rounded-lg border p-6 space-y-6">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            Wymagania
                        </h3>
                        {(editedCourse.wymagania ?? []).map((w, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={w}
                                    onChange={(e) => {
                                        const next = [...(editedCourse.wymagania ?? [])];
                                        next[index] = e.target.value;
                                        updateField("wymagania", next);
                                    }}
                                    className="flex-1 px-3 py-2 border rounded-md"
                                    placeholder="Np. Podstawowa znajomość"
                                />
                                <button
                                    type="button"
                                    onClick={() => updateField("wymagania", (editedCourse.wymagania ?? []).filter((_, i) => i !== index))}
                                    className="px-3 py-2 border rounded-md hover:bg-red-50 text-red-600"
                                >
                                    Usuń
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => updateField("wymagania", [...(editedCourse.wymagania ?? []), ""])}
                            className="px-4 py-2 border rounded-md hover:bg-accent text-sm"
                        >
                            + Dodaj wymaganie
                        </button>
                    </div>

                    {/* Gwarancja i zawartość */}
                    <div className="rounded-lg border p-6 space-y-6">
                        <h3 className="text-xl font-semibold">Gwarancja i zawartość kursu</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Gwarancja (dni, 0 = brak)</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={editedCourse.gwarancjaDni ?? ""}
                                    onChange={(e) => updateField("gwarancjaDni", e.target.value === "" ? undefined : parseInt(e.target.value, 10) || 0)}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="dozywotni-edit"
                                    checked={editedCourse.dozywotniDostep !== false}
                                    onChange={(e) => updateField("dozywotniDostep", e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="dozywotni-edit" className="text-sm font-medium">Dożywotni dostęp</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="materialy-edit"
                                    checked={editedCourse.materialyDoPobrania !== false}
                                    onChange={(e) => updateField("materialyDoPobrania", e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="materialy-edit" className="text-sm font-medium">Materiały do pobrania</label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Zawartość kursu</label>
                            {(editedCourse.zawartoscKursu ?? []).map((punkt, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={punkt}
                                        onChange={(e) => {
                                            const next = [...(editedCourse.zawartoscKursu ?? [])];
                                            next[index] = e.target.value;
                                            updateField("zawartoscKursu", next);
                                        }}
                                        className="flex-1 px-3 py-2 border rounded-md"
                                        placeholder="Np. 12 lekcji wideo"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => updateField("zawartoscKursu", (editedCourse.zawartoscKursu ?? []).filter((_, i) => i !== index))}
                                        className="px-3 py-2 border rounded-md hover:bg-red-50 text-red-600"
                                    >
                                        Usuń
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => updateField("zawartoscKursu", [...(editedCourse.zawartoscKursu ?? []), ""])}
                                className="px-4 py-2 border rounded-md hover:bg-accent text-sm"
                            >
                                + Dodaj pozycję
                            </button>
                        </div>
                    </div>

                    {/* Opis */}
                    <div className="rounded-lg border p-6 space-y-6">
                        <h3 className="text-xl font-semibold">Opis szkolenia</h3>
                        <div>
                            <label className="block text-sm font-medium mb-1">Pełny opis *</label>
                            <button type="button" className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 mb-2" onClick={() => updateField("opis", (editedCourse.opis || "") + "\n")}>Wstaw nowy wiersz</button>
                            <textarea
                                rows={6}
                                value={editedCourse.opis || ""}
                                onChange={(e) => updateField("opis", e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>
                    </div>

                    {/* Kategorie i organizator */}
                    <div className="rounded-lg border p-6 space-y-6">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Kategorie i organizator
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Główna kategoria</label>
                                <select
                                    value={selectedMainCategory}
                                    onChange={(e) => handleMainCategoryChange(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md">
                                    <option value="">Wybierz główną kategorię</option>
                                    {categoriesSlug.map((slug) => (
                                        <option key={slug} value={slug}>{parseSlugName(slug)}</option>
                                    ))}
                                </select>
                                {selectedMainCategory && categories[selectedMainCategory] && (
                                    <div className="space-y-1 mt-2">
                                        <label className="text-xs text-muted-foreground">Podkategorie:</label>
                                        {categories[selectedMainCategory].map((cat) => (
                                            <label key={cat._id || cat.nazwa} className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-accent">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSubCategories.includes(cat._id || "")}
                                                    onChange={() => handleSubCategoryToggle(cat._id || "")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm">{cat.nazwa}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Firma</label>
                                <select
                                    value={selectedFirma}
                                    onChange={(e) => handleFirmaChange(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md">
                                    <option value="">Wybierz firmę</option>
                                    <option value={FIRMA_INNA}>Instruktor nieskojarzony z firmą</option>
                                    {firmy.map((f) => (
                                        <option key={f.nazwa} value={f.slug}>{f.nazwa}</option>
                                    ))}
                                </select>
                            </div>
                            {selectedFirma && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Instruktor</label>
                                    {selectedFirma === FIRMA_INNA ? (
                                        <input
                                            type="text"
                                            value={editedCourse.instruktor || ""}
                                            onChange={(e) => updateField("instruktor", e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md"
                                            placeholder="np. Jan Kowalski"
                                        />
                                    ) : (
                                        <>
                                            <select
                                                value={editedCourse.instruktor || ""}
                                                onChange={(e) => updateField("instruktor", e.target.value)}
                                                className="w-full px-3 py-2 border rounded-md">
                                                <option value="">Wybierz instruktora</option>
                                                {selectedFirm.map((inst) => (
                                                    <option key={inst._id || ""} value={`${inst.imie} ${inst.nazwisko}`}>
                                                        {inst.imie} {inst.nazwisko}
                                                    </option>
                                                ))}
                                            </select>
                                            {editedCourse.instruktor && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <input
                                                type="checkbox"
                                                id="prowizja-cb"
                                                checked={prowizjaCheckbox}
                                                onChange={() => setProwizjaCheckbox((p) => !p)}
                                                className="w-4 h-4"
                                            />
                                            <label htmlFor="prowizja-cb" className="text-sm font-medium cursor-pointer">Inna prowizja dla tego kursu</label>
                                        </div>
                                    )}
                                        </>
                                    )}
                                </div>
                            )}
                            {prowizjaCheckbox && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Prowizja</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={editedCourse.prowizja ?? ""}
                                            onChange={(e) => updateField("prowizja", e.target.value === "" ? undefined : parseFloat(e.target.value))}
                                            className="w-full px-3 py-2 border rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Typ prowizji</label>
                                        <select
                                            value={editedCourse.prowizja_typ || "procent"}
                                            onChange={(e) => updateField("prowizja_typ", e.target.value as "procent" | "kwota")}
                                            className="w-full px-3 py-2 border rounded-md">
                                            <option value="procent">Procent</option>
                                            <option value="kwota">Kwota</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">VAT prowizji</label>
                                        <select
                                            value={editedCourse.prowizja_vat || "brutto"}
                                            onChange={(e) => updateField("prowizja_vat", e.target.value as "brutto" | "netto")}
                                            className="w-full px-3 py-2 border rounded-md">
                                            <option value="brutto">Brutto</option>
                                            <option value="netto">Netto</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Zdjęcia */}
                    <div className="rounded-lg border p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold">Zdjęcia</h3>
                            <button
                                onClick={addMedia}
                                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-1">
                                <Plus className="h-4 w-4" /> Dodaj zdjęcie
                            </button>
                        </div>
                        <div className="space-y-2">
                            {(editedCourse.media || []).map((media, index) => (
                                <div key={index} className="flex gap-2 items-center p-2 border rounded-md">
                                    <input
                                        type="text"
                                        placeholder="Ścieżka"
                                        value={media.path || ""}
                                        onChange={(e) => updateMedia(index, "path", e.target.value)}
                                        className="flex-1 px-3 py-2 border rounded-md"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Alt"
                                        value={media.alt || ""}
                                        onChange={(e) => updateMedia(index, "alt", e.target.value)}
                                        className="flex-1 px-3 py-2 border rounded-md"
                                    />
                                    <button type="button" onClick={() => removeMedia(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                                        <Minus className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Daty i miejsce (godzina_rozpoczecia, godzina_zakonczenia, data_rozpoczecia, adres) */}
                    <div className="rounded-lg border p-6 space-y-6">
                        <h3 className="text-xl font-semibold">Daty i miejsce</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Godzina rozpoczęcia</label>
                                <input
                                    type="text"
                                    value={editedCourse.godzina_rozpoczecia || ""}
                                    onChange={(e) => updateField("godzina_rozpoczecia", e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="np. 09:00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Godzina zakończenia</label>
                                <input
                                    type="text"
                                    value={editedCourse.godzina_zakonczenia || ""}
                                    onChange={(e) => updateField("godzina_zakonczenia", e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="np. 17:00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Data rozpoczęcia</label>
                                <input
                                    type="datetime-local"
                                    value={editedCourse.data_rozpoczecia ? new Date(editedCourse.data_rozpoczecia).toISOString().slice(0, 16) : ""}
                                    onChange={(e) => updateField("data_rozpoczecia", e.target.value ? new Date(e.target.value) : undefined)}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium mb-1">Adres</label>
                                <input
                                    type="text"
                                    value={editedCourse.adres || ""}
                                    onChange={(e) => updateField("adres", e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="Adres szkolenia"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="rounded-lg border p-6">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="aktywne-edit"
                                checked={editedCourse.aktywne !== false}
                                onChange={(e) => updateField("aktywne", e.target.checked)}
                                className="w-4 h-4"
                            />
                            <label htmlFor="aktywne-edit" className="text-sm font-medium">Szkolenie aktywne (widoczne w sklepie)</label>
                        </div>
                    </div>
                </div>

                {/* Przyciski akcji */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        Usuń
                    </button>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border rounded-md hover:bg-accent transition-colors"
                        >
                            Anuluj
                        </button>
                        <button
                            type="button"
                            onClick={() => { handleDuplicate(); setIsSaving(true); }}
                            disabled={isSaving}
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <Copy className="h-4 w-4" />
                            {isSaving ? "Duplikowanie..." : "Duplikuj"}
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {isSaving ? "Zapisywanie..." : "Zapisz"}
                        </button>
                    </div>
                </div>
        </div>
    );
}
