
import { Opinie } from "@/lib/types/shared";
import { renderStars } from "@/lib/utils";
import { useState } from "react";
import { Courses, Firmy } from "@/lib/types/coursesTypes";
import { PlayCircle } from "lucide-react";

interface ReviewTabsProps {
    activeTab: string;
    course: Courses;
    setShowReviewModal: (o: boolean) => void;
}

export default function ReviewTabs({
    activeTab,
    course,
    setShowReviewModal,
}: ReviewTabsProps) {
    const [sortOrder, setSortOrder] = useState<
        "latest" | "oldest" | "highest" | "lowest"
    >("latest");
    const [visibleReviews, setVisibleReviews] = useState(4);

    // Sortowanie recenzji
    const sortedReviews = () => {
        console.log(course);
        if (!course.opinie) return [];
        return [...(course?.opinie as Opinie[])].sort((a, b) => {
            switch (sortOrder) {
                case "latest":
                    return (
                        new Date(b.createdAt!).getTime() -
                        new Date(a.createdAt!).getTime()
                    );
                case "oldest":
                    return (
                        new Date(a.createdAt!).getTime() -
                        new Date(b.createdAt!).getTime()
                    );
                case "highest":
                    return b.ocena - a.ocena;
                case "lowest":
                    return a.ocena - b.ocena;
                default:
                    return 0;
            }
        });
    };

    const displayedReviews = sortedReviews().slice(0, visibleReviews);

    return (
        <>
            {/* Product Details Tab */}
            {activeTab === "overview" && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900">O tym szkoleniu</h3>
                    <p>{course.opis.split("\\n").map((text) => (
                        <span key={text}>{text}<br /></span>
                    ))}</p>
                    {course.firma ? (
                        <div className="pt-4">
                            <span className="border-b border-gray-900 w-full"></span>
                            <h4 className="font-bold text-gray-900">Firma odpowiedzialna</h4>
                            <p className="text-gray-600">{(course.firma as Firmy).nazwa}</p>
                            <p className="text-gray-600">{(course.instruktor)}</p>
                        </div>
                    ) : (
                        <div className="pt-4">
                            <span className="border-b border-gray-900 w-full"></span>
                            <h4 className="font-bold text-gray-900">Instruktor</h4>
                            <p className="text-gray-600">{(course.instruktor)}</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "curriculum" && (
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900">Program szkolenia</h3>
                    {(course.lekcje?.length ?? 0) > 0 ? (
                        <div className="space-y-4">
                            {course.lekcje!.map((lekcja, i) => (
                                <div key={i} className="flex items-start justify-between gap-4 py-2 border-b border-gray-100">
                                    <div className="flex items-start gap-2 min-w-0 flex-1">
                                        <PlayCircle className="h-4 w-4 text-[#D2B79B] shrink-0 mt-0.5" />
                                        <div className="flex flex-col gap-0.5 min-w-0">
                                            <span className="font-semibold text-gray-800">Lekcja {i + 1}: {lekcja.tytul}</span>
                                            <span className="text-sm text-gray-500">{lekcja.opis || "—"}</span>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500 shrink-0 whitespace-nowrap">{lekcja.dlugosc || "—"}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">Brak dodanego programu.</p>
                    )}
                </div>
            )}


            {activeTab === "reviews" && (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-gray-900">
                                Oceny naszych klientów
                            </h2>
                            <span className="text-sm text-gray-500">
                                ({course.opinie?.length})
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                className="px-4 py-2 rounded-lg border border-[rgba(212,196,176,0.5)] bg-white text-sm font-medium hover:bg-[#f0e8dd] transition-colors"
                                aria-label="Filtr">
                                <svg
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    width="20"
                                    height="20">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                                    />
                                </svg>
                            </button>
                            <div className="flex items-center gap-2">
                                <select
                                    value={sortOrder}
                                    onChange={(e) =>
                                        setSortOrder(
                                            e.target.value as typeof sortOrder,
                                        )
                                    }
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 outline-none">
                                    <option value="latest">Najnowsze</option>
                                    <option value="oldest">Najstarsze</option>
                                    <option value="highest">
                                        Najwyższa ocena
                                    </option>
                                    <option value="lowest">
                                        Najniższa ocena
                                    </option>
                                </select>
                            </div>
                            <button
                                className="px-4 py-2 rounded-lg bg-[#D2B79B] text-black font-semibold hover:bg-[#b89a7f] transition-colors"
                                onClick={() => setShowReviewModal(true)}>
                                Napisz opinię
                            </button>
                        </div>
                    </div>

                    {/* Reviews Grid */}
                    {displayedReviews.length > 0 ? (
                        <div className="grid gap-4">
                            {displayedReviews.map((review, index) => (
                                <div key={index} className="rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60 p-4">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-1">
                                            {renderStars(review.ocena, 18)}
                                        </div>
                                        <button
                                            className="text-sm text-[#D2B79B] hover:underline"
                                            aria-label="Więcej opcji">
                                            <svg
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                width="20"
                                                height="20">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                        <span className="font-medium text-gray-800">
                                            {review.uzytkownik}
                                        </span>
                                        {review.zweryfikowane && (
                                            <span
                                                className="text-xs text-green-600"
                                                title="Zweryfikowany zakup">
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    width="16"
                                                    height="16">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        {review.tresc}
                                    </p>
                                    <div className="text-xs text-gray-400 mt-2">
                                        Opublikowano{" "}
                                        {/* {review.createdAt!.toDateString()} */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>
                                Brak recenzji dla tego produktu. Bądź pierwszy i
                                napisz recenzję!
                            </p>
                        </div>
                    )}

                    {/* Load More Button */}
                    {visibleReviews < sortedReviews.length && (
                        <div className="flex justify-center pt-4">
                            <button
                                className="px-4 py-2 rounded-lg border border-[#D2B79B] text-[#D2B79B] font-medium hover:bg-[#D2B79B]/10 transition-colors"
                                onClick={() =>
                                    setVisibleReviews((prev) => prev + 4)
                                }>
                                Wczytaj więcej opinii
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* FAQs Tab */}
            {activeTab === "faqs" && (
                <div className="rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60 p-6">
                    <div className="space-y-4 text-gray-700">
                        <h3>Często zadawane pytania</h3>
                        <p>
                            Brak dostępnych pytań i odpowiedzi dla tego
                            kursu.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
