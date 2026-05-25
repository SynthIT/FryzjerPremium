"use client";

import { useEffect, useState } from "react";
import { Categories } from "@/lib/types/shared";

/** Opcje kategorii głównych (dla formularzy new/edit kategorii). */
export function useCategoryParentOptions() {
    const [mainCategories, setMainCategories] = useState<string[]>([]);
    const [existingCategories, setExistingCategories] = useState<
        Record<string, Categories[]>
    >({});
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
                    const catList: Categories[] =
                        typeof data.categories === "string"
                            ? JSON.parse(data.categories)
                            : data.categories;
                    setExistingCategories(
                        catList.reduce<Record<string, Categories[]>>((acc, cat) => {
                            const k = cat.kategoria ?? "";
                            (acc[k] ??= []).push(cat);
                            return acc;
                        }, {}),
                    );
                    const mains = catList.reduce<string[]>((acc, cat) => {
                        if (cat.kategoria && !acc.includes(cat.kategoria))
                            acc.push(cat.kategoria);
                        return acc;
                    }, []);
                    setMainCategories(mains);
                }
            } catch (error) {
                console.error("Błąd podczas pobierania kategorii:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCategories();
    }, []);

    return { mainCategories, existingCategories, loading };
}
