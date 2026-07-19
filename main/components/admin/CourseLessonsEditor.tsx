"use client";

import { Lekcja } from "@/lib/types/coursesTypes";
import { adminInputClass, adminModalInputClass } from "./adminFormStyles";

type Variant = "page" | "modal";

interface CourseLessonsEditorProps {
    liczbaLekcji: number | undefined;
    lekcje: Lekcja[];
    onLiczbaLekcjiChange: (n: number | undefined) => void;
    onLekcjeChange: (lekcje: Lekcja[]) => void;
    variant?: Variant;
    showLiczbaInput?: boolean;
}

export default function CourseLessonsEditor({
    liczbaLekcji,
    lekcje,
    onLiczbaLekcjiChange,
    onLekcjeChange,
    variant = "page",
    showLiczbaInput = true,
}: CourseLessonsEditorProps) {
    const inputClass = variant === "page" ? adminInputClass : adminModalInputClass;

    const updateLesson = (index: number, key: keyof Lekcja, value: string) => {
        onLekcjeChange(
            lekcje.map((lesson, i) =>
                i === index ? { ...lesson, [key]: value } : lesson,
            ),
        );
    };

    return (
        <>
            {showLiczbaInput && (
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Liczba lekcji
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={liczbaLekcji ?? ""}
                        onChange={(e) =>
                            onLiczbaLekcjiChange(
                                e.target.value === ""
                                    ? undefined
                                    : parseInt(e.target.value, 10) || 0,
                            )
                        }
                        className={inputClass}
                    />
                </div>
            )}
            {(lekcje?.length ?? 0) > 0 && (
                <div className="space-y-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {(lekcje ?? []).map((lekcja, index) => (
                        <div
                            key={index}
                            className="rounded-lg border p-4 space-y-4">
                            <h4 className="font-medium text-lg">
                                Lekcja #{index + 1}
                            </h4>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium mb-1">
                                        Tytuł lekcji
                                    </label>
                                    <input
                                        type="text"
                                        value={lekcja.tytul}
                                        onChange={(e) =>
                                            updateLesson(
                                                index,
                                                "tytul",
                                                e.target.value,
                                            )
                                        }
                                        className={inputClass}
                                        placeholder="Np. Wprowadzenie"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium mb-1">
                                        Opis lekcji
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={lekcja.opis}
                                        onChange={(e) =>
                                            updateLesson(
                                                index,
                                                "opis",
                                                e.target.value,
                                            )
                                        }
                                        className={inputClass}
                                        placeholder="Krótki opis lekcji"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Długość (np. 15:30 lub 45 min)
                                    </label>
                                    <input
                                        type="text"
                                        value={lekcja.dlugosc}
                                        onChange={(e) =>
                                            updateLesson(
                                                index,
                                                "dlugosc",
                                                e.target.value,
                                            )
                                        }
                                        className={inputClass}
                                        placeholder="15:30"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
