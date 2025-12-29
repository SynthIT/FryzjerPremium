"use client";

import { Categories } from "@/lib/models/Products";

interface AdminCategoryCardProps {
    category: Categories;
    onClick: () => void;
}

export default function AdminCategoryCard({
    category,
    onClick,
}: AdminCategoryCardProps) {
    return (
        <div
            onClick={onClick}
            className="border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer bg-card hover:bg-accent/50 group">
            {/* Content */}
            <div className="space-y-2">
                {/* Title */}
                <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {category.nazwa || "Brak nazwy"}
                </h3>

                {/* Slug */}
                <p className="text-sm text-muted-foreground">
                    {category.slug || "Brak slug"}
                </p>
            </div>
        </div>
    );
}
