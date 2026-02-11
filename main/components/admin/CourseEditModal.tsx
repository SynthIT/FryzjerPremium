"use client";

import { useState, useEffect } from "react";
import { Courses, Categories, Firmy, Media } from "@/lib/types/coursesTypes.";
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

interface CourseEditModalProps {
    course: Courses;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (course: Courses) => void;
    onDelete: (courseSlug: string) => void;
}

export default function CourseEditModal({
    course,
    isOpen,
    onClose,
    onUpdate,
    onDelete,
}: CourseEditModalProps) {
    const [editedCourse, setEditedCourse] = useState<Courses>(course);
    const [isSaving, setIsSaving] = useState(false);
    
    // Kategorie i firma z API
    const [categories, setCategories] = useState<Record<string, Categories[]>>({});
    const [categoriesSlug, setCategoriesSlug] = useState<string[]>([]);
    const [firmy, setFirmy] = useState<Firmy[]>([]);
    
    // Wybrane kategorie (główna + podrzędne)
    const [selectedMainCategory, setSelectedMainCategory] = useState<string>("");
    const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
    const [selectedFirma, setSelectedFirma] = useState<string>("");

    useEffect(() => {
        setEditedCourse(course);
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
                    
                    // Ustaw wybrane kategorie na podstawie kursu
                    const courseCategories = getCategories();
                    if (courseCategories.length > 0) {
                        const firstCat = courseCategories[0];
                        const mainSlug = firstCat.slug;
                        setSelectedMainCategory(mainSlug);
                        setSelectedSubCategories(
                            courseCategories
                                .map((cat) => cat._id || "")
                                .filter((id) => id)
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
                if (Array.isArray(data)) {
                    setFirmy(data);
                    
                    // Ustaw wybraną firmę na podstawie kursu
                    const courseFirma = getFirma();
                    if (courseFirma && typeof courseFirma === "object" && "_id" in courseFirma) {
                        setSelectedFirma((courseFirma as Firmy)._id || "");
                    }
                }
            } catch (error) {
                console.error("Błąd podczas pobierania firm:", error);
            }
        }
        fetchFirmy();
    }, []);

    const getCategories = (): Categories[] => {
        if (!editedCourse.kategoria) return [];
        if (Array.isArray(editedCourse.kategoria)) {
            return editedCourse.kategoria.filter(
                (cat): cat is Categories =>
                    typeof cat === "object" && cat !== null && "nazwa" in cat
            ) as Categories[];
        }
        return [];
    };

    const getFirma = (): Firmy | string | null => {
        return editedCourse.firma || null;
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
            const firmaData = firmy.find((f) => f._id === selectedFirma);
            if (firmaData) {
                editedCourse.firma = firmaData._id || firmaData;
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
                alert("Błąd podczas zapisywania: " + (result.error || "Nieznany błąd"));
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
                }
            );

            const result = await response.json();
            if (result.status === 0 || response.ok) {
                onDelete(editedCourse.slug);
            } else {
                alert("Błąd podczas usuwania kursu: " + (result.error || "Nieznany błąd"));
            }
        } catch (error) {
            console.error("Błąd podczas usuwania kursu:", error);
            alert("Błąd podczas usuwania kursu. Sprawdź konsolę.");
        }
    };

    const updateField = <K extends keyof Courses>(
        field: K,
        value: Courses[K]
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

    const handleSubCategoryToggle = (subCategoryId: string) => {
        setSelectedSubCategories((prev) => {
            const newSelected = prev.includes(subCategoryId)
                ? prev.filter((id) => id !== subCategoryId)
                : [...prev, subCategoryId];
            
            if (selectedMainCategory && categories[selectedMainCategory]) {
                const selectedCats = categories[selectedMainCategory].filter(
                    (cat) => newSelected.includes(cat._id || "")
                );
                updateField("kategoria", selectedCats);
            }
            
            return newSelected;
        });
    };

    const handleFirmaChange = (firmaId: string) => {
        setSelectedFirma(firmaId);
        const firmaData = firmy.find((f) => f._id === firmaId);
        if (firmaData) {
            updateField("firma", firmaData._id || firmaData);
        }
    };

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
        updateField("media", media.filter((_, i) => i !== index));
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold">Edytuj szkolenie</h2>
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
                        <h3 className="text-lg font-semibold">Podstawowe informacje</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Nazwa szkolenia *
                                </label>
                                <input
                                    type="text"
                                    value={editedCourse.nazwa || ""}
                                    onChange={(e) => updateField("nazwa", e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Slug
                                </label>
                                <input
                                    type="text"
                                    value={editedCourse.slug || ""}
                                    onChange={(e) => updateField("slug", e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Cena (bez VAT) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editedCourse.cena || 0}
                                    onChange={(e) =>
                                        updateField("cena", parseFloat(e.target.value) || 0)
                                    }
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    VAT (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={editedCourse.vat || 23}
                                    onChange={(e) =>
                                        updateField("vat", parseFloat(e.target.value) || 23)
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
                                    value={editedCourse.ocena || 0}
                                    onChange={(e) =>
                                        updateField("ocena", parseFloat(e.target.value) || 0)
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
                                    value={editedCourse.sku || ""}
                                    onChange={(e) => updateField("sku", e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={editedCourse.aktywne !== false}
                                    onChange={(e) => updateField("aktywne", e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <label className="text-sm font-medium">Aktywny</label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Opis *
                            </label>
                            <textarea
                                rows={4}
                                value={editedCourse.opis || ""}
                                onChange={(e) => updateField("opis", e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>
                    </div>

                    {/* Kategorie */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Kategorie</h3>
                        <div className="space-y-2">
                            <select
                                value={selectedMainCategory}
                                onChange={(e) => handleMainCategoryChange(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md">
                                <option value="">Wybierz główną kategorię</option>
                                {categoriesSlug.map((slug) => (
                                    <option key={slug} value={slug}>
                                        {parseSlugName(slug)}
                                    </option>
                                ))}
                            </select>
                            {selectedMainCategory && categories[selectedMainCategory] && (
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">
                                        Wybierz podkategorie (wiele):
                                    </label>
                                    {categories[selectedMainCategory].map((cat) => (
                                        <label
                                            key={cat._id || cat.nazwa}
                                            className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-accent">
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

                    {/* Firma */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Firma</h3>
                        <select
                            value={selectedFirma}
                            onChange={(e) => handleFirmaChange(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md">
                            <option value="">Wybierz firmę</option>
                            {firmy.map((firma) => (
                                <option key={firma._id || firma.nazwa} value={firma._id || ""}>
                                    {firma.nazwa}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Media */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Zdjęcia</h3>
                            <button
                                onClick={addMedia}
                                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-1">
                                <Plus className="h-4 w-4" />
                                Dodaj zdjęcie
                            </button>
                        </div>
                        <div className="space-y-2">
                            {(editedCourse.media || []).map((media, index) => (
                                <div key={index} className="flex gap-2 items-center p-2 border rounded-md">
                                    <input
                                        type="text"
                                        placeholder="Ścieżka do zdjęcia"
                                        value={media.path || ""}
                                        onChange={(e) => updateMedia(index, "path", e.target.value)}
                                        className="flex-1 px-3 py-2 border rounded-md"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Alt text"
                                        value={media.alt || ""}
                                        onChange={(e) => updateMedia(index, "alt", e.target.value)}
                                        className="flex-1 px-3 py-2 border rounded-md"
                                    />
                                    <button
                                        onClick={() => removeMedia(index)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                                        <Minus className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t">
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Usuń
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm border rounded-md hover:bg-accent transition-colors">
                            Anuluj
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50">
                            <Save className="h-4 w-4" />
                            {isSaving ? "Zapisywanie..." : "Zapisz"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
