"use client";

import { Categories } from "@/lib/types/shared";
import { parseSlugName } from "@/lib/utils_admin";
import { adminInputClass, adminModalInputClass } from "./adminFormStyles";

type Variant = "page" | "modal";

interface AdminCategoryPickerProps {
    categories: Record<string, Categories[]>;
    categoriesSlug: string[];
    selectedMainCategory: string;
    selectedSubCategories: string[];
    onMainCategoryChange: (main: string) => void;
    onSubCategoryToggle: (subId: string) => void;
    variant?: Variant;
    required?: boolean;
    parseMainLabels?: boolean;
}

export default function AdminCategoryPicker({
    categories,
    categoriesSlug,
    selectedMainCategory,
    selectedSubCategories,
    onMainCategoryChange,
    onSubCategoryToggle,
    variant = "page",
    required = false,
    parseMainLabels = false,
}: AdminCategoryPickerProps) {
    const selectClass = variant === "page" ? adminInputClass : adminModalInputClass;

    return (
        <div className="space-y-2">
            <select
                value={selectedMainCategory}
                onChange={(e) => onMainCategoryChange(e.target.value)}
                required={required}
                className={selectClass}>
                <option value="">Wybierz główną kategorię</option>
                {categoriesSlug.map((slug) => (
                    <option key={slug} value={slug}>
                        {parseMainLabels ? parseSlugName(slug) : slug}
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
                                onChange={() => onSubCategoryToggle(cat._id || "")}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">{cat.nazwa}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}
