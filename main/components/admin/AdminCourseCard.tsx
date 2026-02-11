"use client";

import Image from "next/image";
import { Courses, Categories, Firmy } from "@/lib/types/coursesTypes";

interface AdminCourseCardProps {
    course: Courses;
    onClick: () => void;
}

export default function AdminCourseCard({
    course,
    onClick,
}: AdminCourseCardProps) {
    // Obsługa kategorii - może być arrayem
    const getCategories = (): Categories[] => {
        if (!course.kategoria) return [];
        if (Array.isArray(course.kategoria)) {
            return course.kategoria.filter(
                (cat): cat is Categories =>
                    typeof cat === "object" &&
                    cat !== null &&
                    "nazwa" in cat &&
                    "slug" in cat
            ) as Categories[];
        }
        return [];
    };

    const categories = getCategories();
    const firstCategory = categories[0];

    // Obsługa firmy
    const getFirmaName = (): string => {
        if (!course.firma) return "Brak firmy";
        if (typeof course.firma === "string") return course.firma;
        if (
            typeof course.firma === "object" &&
            "nazwa" in course.firma
        ) {
            return (course.firma as Firmy).nazwa || "Brak firmy";
        }
        return "Brak firmy";
    };

    const firmaName = getFirmaName();

    // Obsługa zdjęcia
    const getImageSrc = (): string | null => {
        if (
            course.media &&
            Array.isArray(course.media) &&
            course.media.length > 0
        ) {
            return course.media[0].path || null;
        }
        return null;
    };

    const imageSrc = getImageSrc();
    const imageAlt = course.media?.[0]?.alt || course.nazwa || "Kurs";

    // Skrócony opis
    const shortDescription =
        course.opis && course.opis.length > 100
            ? `${course.opis.substring(0, 100)}...`
            : course.opis || "Brak opisu";

    return (
        <div
            onClick={onClick}
            className="border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer bg-card hover:bg-accent/50 group">
            {/* Image */}
            <div className="relative w-full h-48 mb-4 bg-muted rounded-lg overflow-hidden">
                {imageSrc ? (
                    <Image
                        src={imageSrc}
                        alt={imageAlt}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                        <span className="text-4xl">📚</span>
                    </div>
                )}
                {/* Status badge */}
                {course.aktywne === false && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        Nieaktywny
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="space-y-2">
                {/* Title */}
                <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {course.nazwa || "Brak nazwy"}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {shortDescription}
                </p>

                {/* Price */}
                <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                        <div className="font-bold text-lg">
                            {course.cena
                                ? `${course.cena.toFixed(2)} zł`
                                : "Brak ceny"}
                        </div>
                        {course.promocje &&
                            typeof course.promocje === "object" &&
                            "procent" in course.promocje && (
                                <div className="text-xs text-green-600">
                                    Promocja: -
                                    {(course.promocje as any).procent}%
                                </div>
                            )}
                    </div>
                    <div className="text-right">
                        {course.ocena !== undefined && (
                            <div className="text-sm">
                                <span className="text-yellow-500">⭐</span>{" "}
                                {course.ocena.toFixed(1)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Category and Company */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex flex-wrap gap-1">
                        {firstCategory ? (
                            <span className="px-2 py-1 bg-muted rounded">
                                {firstCategory.nazwa ||
                                    firstCategory.slug ||
                                    "Brak kategorii"}
                            </span>
                        ) : (
                            <span className="px-2 py-1 bg-muted rounded">
                                Brak kategorii
                            </span>
                        )}
                        {categories.length > 1 && (
                            <span className="px-2 py-1 bg-muted rounded">
                                +{categories.length - 1}
                            </span>
                        )}
                    </div>
                    <div
                        className="truncate max-w-[120px]"
                        title={firmaName}>
                        {firmaName}
                    </div>
                </div>

                {/* Additional Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <div>
                        {course.sku && (
                            <span>SKU: {course.sku}</span>
                        )}
                    </div>
                    <div>
                        {course.vat !== undefined && (
                            <span>VAT: {course.vat}%</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
