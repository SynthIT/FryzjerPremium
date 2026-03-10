"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Courses, Firmy } from "@/lib/types/coursesTypes";
import { Categories, Promos } from "@/lib/types/shared";
import { MoreVertical, Pencil, Copy, Trash2 } from "lucide-react";

interface AdminCourseCardProps {
    course: Courses;
    onClick: () => void;
    onDuplicate?: (course: Courses) => void;
    onDelete?: (course: Courses) => void;
}

export default function AdminCourseCard({
    course,
    onClick,
    onDuplicate,
    onDelete,
}: AdminCourseCardProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!menuOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [menuOpen]);

    // Obsługa kategorii - może być arrayem
    const getCategories = (): Categories[] => {
        if (!course.kategoria) return [];
        if (Array.isArray(course.kategoria)) {
            return course.kategoria.filter(
                (cat): cat is Categories =>
                    typeof cat === "object" &&
                    cat !== null &&
                    "nazwa" in cat &&
                    "slug" in cat,
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
        if (typeof course.firma === "object" && "nazwa" in course.firma) {
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
        <div className="border rounded-lg p-4 bg-card hover:shadow-lg transition-all relative">
            {/* Menu 3 kropki - prawy górny róg */}
            <div className="absolute top-3 right-3 z-10" ref={menuRef}>
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenuOpen((v) => !v);
                    }}
                    className="p-1.5 rounded-md hover:bg-accent/80 bg-background/90 shadow border transition-colors"
                    aria-label="Menu"
                >
                    <MoreVertical className="h-5 w-5 text-muted-foreground" />
                </button>
                {menuOpen && (
                    <div className="absolute right-0 top-full mt-1 py-1 min-w-[140px] rounded-md border bg-popover shadow-lg z-20">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setMenuOpen(false);
                                onClick();
                            }}
                            className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-accent rounded-none first:rounded-t-md last:rounded-b-md"
                        >
                            <Pencil className="h-4 w-4" />
                            Edytuj
                        </button>
                        {onDuplicate && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setMenuOpen(false);
                                    onDuplicate(course);
                                }}
                                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-accent rounded-none first:rounded-t-md last:rounded-b-md"
                            >
                                <Copy className="h-4 w-4" />
                                Duplikuj
                            </button>
                        )}
                        {onDelete && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setMenuOpen(false);
                                    onDelete(course);
                                }}
                                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-destructive/15 text-destructive rounded-none first:rounded-t-md last:rounded-b-md"
                            >
                                <Trash2 className="h-4 w-4" />
                                Usuń
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Klikalna strefa: zdjęcie + nazwa + opis */}
            <button
                type="button"
                onClick={onClick}
                className="w-full text-left rounded-lg overflow-hidden hover:bg-accent/30 transition-colors group focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card"
            >
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
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                            Nieaktywny
                        </div>
                    )}
                </div>

                {/* Title + Description */}
                <div className="space-y-2 px-0 -mt-2">
                    <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {course.nazwa || "Brak nazwy"}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {shortDescription}
                    </p>
                </div>
            </button>

            {/* Reszta karty – bez onClick */}
            <div className="space-y-2 pt-0">
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
                                    {(course.promocje as Promos).procent}%
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
                    <div className="truncate max-w-[120px]" title={firmaName}>
                        {firmaName}
                    </div>
                </div>

                {/* Additional Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <div>{course.sku && <span>SKU: {course.sku}</span>}</div>
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
