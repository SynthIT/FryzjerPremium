"use client";

import { useState, useEffect, useMemo } from "react";
import { Courses, Firmy, Lekcja } from "@/lib/types/coursesTypes";
import { Categories, Media, Promos } from "@/lib/types/shared";
import Link from "next/link";
import { Save, Trash2, Plus, Minus, Copy, BookOpen, Clock, Award, Info, Users } from "lucide-react";
import { generateSlug } from "@/lib/utils_admin";
import { randomBytes } from "crypto";
import { useRouter } from "next/navigation";
import { CenaTyp } from "@/lib/admin/pricing";
import AdminPriceVatFields from "@/components/admin/AdminPriceVatFields";
import { useCategoryTree } from "@/components/admin/hooks/useCategoryTree";
import AdminCategoryPicker from "@/components/admin/AdminCategoryPicker";
import CourseLessonsEditor from "@/components/admin/CourseLessonsEditor";
import {
    AdminFormSection,
    adminFormPageGrid,
    adminFormSpanFull,
} from "@/components/admin/AdminFormLayout";
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
    const [cenaTyp, setCenaTyp] = useState<CenaTyp>("netto");
    const categoryTree = useCategoryTree();
    const [firmy, setFirmy] = useState<Firmy[]>([]);
    const [selectedFirma, setSelectedFirma] = useState<string>("");
    const [promos, setPromos] = useState<Promos[]>([]);
    const [selectedPromoId, setSelectedPromoId] = useState<string>("");

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

    useEffect(() => {
        if (!categoryTree.categoriesSlug.length) return;
        const courseCategories = getCategories();
        if (courseCategories.length === 0) return;
        const catList = Object.values(categoryTree.categories).flat();
        const ids = courseCategories
            .map((c) => c._id || "")
            .filter(Boolean);
        let main = "";
        const first = courseCategories[0];
        main =
            (first as Categories & { kategoria?: string }).kategoria ??
            catList.find((c) => (c._id ?? "") === ids[0])?.kategoria ??
            "";
        categoryTree.setInitialSelection(main, ids);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [course.kategoria, categoryTree.categoriesSlug.length]);

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

    useEffect(() => {
        const p = course.promocje;
        if (p == null) setSelectedPromoId("");
        else if (typeof p === "object" && p !== null && "_id" in p)
            setSelectedPromoId(String((p as { _id: string })._id));
        else setSelectedPromoId(String(p));
    }, [course]);

    useEffect(() => {
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
    }, [course.slug]);

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
            const ids = categoryTree.getSelectedCategoryIds();
            const selectedCategories = ids
                .map((id) =>
                    Object.values(categoryTree.categories)
                        .flat()
                        .find((c) => c._id === id),
                )
                .filter(Boolean) as Categories[];
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

            editedCourse.promocje = (
                selectedPromoId === "" ? null : selectedPromoId
            ) as Courses["promocje"];

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

    const removeMedia = (index: number) => {
        const media = editedCourse.media || [];
        updateField(
            "media",
            media.filter((_, i) => i !== index),
        );
    };

    return (
        <div className="space-y-6 text-gray-900 sm:space-y-8 [&_input]:text-gray-900 [&_input]:bg-white [&_select]:text-gray-900 [&_select]:bg-white [&_textarea]:text-gray-900 [&_textarea]:bg-white [&_input::placeholder]:text-gray-500 [&_textarea::placeholder]:text-gray-500">
            <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-gray-900">
                    Edytuj szkolenie
                </h1>
                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                    Zmień dane szkolenia i zapisz zmiany.
                </p>
            </div>

            <div className={adminFormPageGrid}>
                    <AdminFormSection title="Podstawowe informacje" icon={BookOpen}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium mb-1">Nazwa szkolenia *</label>
                                <input
                                    type="text"
                                    value={editedCourse.nazwa || ""}
                                    onChange={(e) => updateField("nazwa", e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                                <p className="text-xs text-gray-600 mt-1">Slug: {editedCourse.slug || "(auto)"}</p>
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
                                <p className="text-xs text-gray-600 mt-1">{editedCourse.krotkiOpis?.length ?? 0}/120</p>
                            </div>
                            <AdminPriceVatFields
                                label="Cena *"
                                required
                                storedNetValue={editedCourse.cena || 0}
                                vatPercent={editedCourse.vat ?? 23}
                                cenaTyp={cenaTyp}
                                onStoredNetChange={(v) => updateField("cena", v)}
                                onCenaTypChange={setCenaTyp}
                                variant="modal"
                            />
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
                                <p className="text-xs text-gray-600 mt-1">
                                    <Link
                                        href="/admin/discounts/new"
                                        className="text-[#D2B79B] hover:underline">
                                        Dodaj nową promocję
                                    </Link>
                                </p>
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
                    </AdminFormSection>

                    <AdminFormSection title="Parametry szkolenia" icon={Clock}>
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
                    </AdminFormSection>

                    {(editedCourse.lekcje?.length ?? 0) > 0 && (
                        <AdminFormSection
                            title="Szczegóły lekcji"
                            icon={Clock}
                            className={adminFormSpanFull}>
                            <CourseLessonsEditor
                                liczbaLekcji={editedCourse.liczbaLekcji ?? undefined}
                                lekcje={editedCourse.lekcje ?? []}
                                onLiczbaLekcjiChange={(n) =>
                                    updateField("liczbaLekcji", n)
                                }
                                onLekcjeChange={(lekcje) =>
                                    updateField("lekcje", lekcje)
                                }
                                variant="modal"
                                showLiczbaInput={false}
                            />
                        </AdminFormSection>
                    )}

                    <AdminFormSection title="Czego się nauczysz" icon={Award}>
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
                    </AdminFormSection>

                    <AdminFormSection title="Wymagania" icon={Info}>
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
                    </AdminFormSection>

                    <AdminFormSection title="Gwarancja i zawartość">
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
                    </AdminFormSection>

                    <AdminFormSection
                        title="Opis szkolenia"
                        icon={BookOpen}
                        className={adminFormSpanFull}>
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
                    </AdminFormSection>

                    <AdminFormSection title="Kategorie i organizator" icon={Users}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
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
                                    variant="modal"
                                    parseMainLabels
                                />
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
                    </AdminFormSection>

                    <AdminFormSection title="Zdjęcia" className={adminFormSpanFull}>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Media kursu</span>
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
                    </AdminFormSection>

                    <AdminFormSection title="Daty i miejsce" icon={Clock}>
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
                    </AdminFormSection>

                    <AdminFormSection title="Publikacja" className={adminFormSpanFull}>
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
                    </AdminFormSection>
                </div>

                <div className={`flex flex-wrap items-center justify-between gap-4 ${adminFormSpanFull}`}>
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
