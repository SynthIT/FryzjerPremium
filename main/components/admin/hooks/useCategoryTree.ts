"use client";

import { useEffect, useState, useCallback } from "react";
import { Categories } from "@/lib/types/shared";

export function useCategoryTree() {
    const [categories, setCategories] = useState<Record<string, Categories[]>>({});
    const [categoriesSlug, setCategoriesSlug] = useState<string[]>([]);
    const [selectedMainCategory, setSelectedMainCategory] = useState("");
    const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

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
                    const catList: Categories[] =
                        typeof raw === "string"
                            ? JSON.parse(raw)
                            : Array.isArray(raw)
                              ? raw
                              : [];
                    const byKategoria = catList.reduce<Record<string, Categories[]>>(
                        (acc, c) => {
                            const k = c.kategoria ?? "";
                            (acc[k] ??= []).push(c);
                            return acc;
                        },
                        {},
                    );
                    setCategories(byKategoria);
                    setCategoriesSlug(Object.keys(byKategoria));
                }
            } catch (error) {
                console.error("Błąd podczas pobierania kategorii:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCategories();
    }, []);

    const handleMainCategoryChange = useCallback((mainSlug: string) => {
        setSelectedMainCategory(mainSlug);
        setSelectedSubCategories([]);
    }, []);

    const handleSubCategoryToggle = useCallback((subCategoryId: string) => {
        setSelectedSubCategories((prev) =>
            prev.includes(subCategoryId)
                ? prev.filter((id) => id !== subCategoryId)
                : [...prev, subCategoryId],
        );
    }, []);

    const setInitialSelection = useCallback(
        (main: string, subIds: string[]) => {
            if (main) setSelectedMainCategory(main);
            if (subIds.length) setSelectedSubCategories(subIds);
        },
        [],
    );

    const getSelectedCategoryIds = useCallback((): string[] => {
        if (!selectedMainCategory || !categories[selectedMainCategory]) {
            return selectedSubCategories.filter(Boolean);
        }
        return categories[selectedMainCategory]
            .filter((cat) => selectedSubCategories.includes(cat._id || ""))
            .map((cat) => cat._id as string)
            .filter(Boolean);
    }, [categories, selectedMainCategory, selectedSubCategories]);

    return {
        categories,
        categoriesSlug,
        selectedMainCategory,
        selectedSubCategories,
        loading,
        handleMainCategoryChange,
        handleSubCategoryToggle,
        setInitialSelection,
        getSelectedCategoryIds,
    };
}
