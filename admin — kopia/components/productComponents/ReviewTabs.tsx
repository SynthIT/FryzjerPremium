import { Opinie, Products } from "@/lib/models/Products";
import { renderStars } from "@/lib/utils";
import { useState } from "react";

interface ReviewTabsProps {
    activeTab: string;
    product: Products;
    setShowReviewModal: (o: boolean) => void;
}

export default function ReviewTabs({
    activeTab,
    product,
    setShowReviewModal,
}: ReviewTabsProps) {
    const [sortOrder, setSortOrder] = useState<
        "latest" | "oldest" | "highest" | "lowest"
    >("latest");
    const [visibleReviews, setVisibleReviews] = useState(4);

    // Sortowanie recenzji
    const sortedReviews = [...(product?.opinie as Opinie[])].sort((a, b) => {
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

    const displayedReviews = sortedReviews.slice(0, visibleReviews);

    return (
        <>
            {activeTab === "reviews" && (
                <div className="reviews-content">
                    {/* Header */}
                    <div className="reviews-header">
                        <div className="reviews-title-section">
                            <h2 className="reviews-title">
                                Oceny naszych klientów
                            </h2>
                            <span className="reviews-count">
                                ({product.opinie?.length})
                            </span>
                        </div>
                        <div className="reviews-actions">
                            <button
                                className="reviews-filter-button"
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
                            <div className="reviews-sort-dropdown">
                                <select
                                    value={sortOrder}
                                    onChange={(e) =>
                                        setSortOrder(
                                            e.target.value as typeof sortOrder
                                        )
                                    }
                                    className="sort-select">
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
                                className="write-review-button"
                                onClick={() => setShowReviewModal(true)}>
                                Napisz opinię
                            </button>
                        </div>
                    </div>

                    {/* Reviews Grid */}
                    {displayedReviews.length > 0 ? (
                        <div className="reviews-grid">
                            {displayedReviews.map((review, index) => (
                                <div key={index} className="review-card">
                                    <div className="review-card-header">
                                        <div className="review-rating">
                                            {renderStars(review.ocena, 18)}
                                        </div>
                                        <button
                                            className="review-more-button"
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
                                    <div className="review-reviewer">
                                        <span className="reviewer-name">
                                            {review.uzytkownik}
                                        </span>
                                        {review.zweryfikowane && (
                                            <span
                                                className="verified-badge"
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
                                    <p className="review-text">
                                        {review.tresc}
                                    </p>
                                    <div className="review-date">
                                        Opublikowano{" "}
                                        {/* {review.createdAt!.toDateString()} */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-reviews-message">
                            <p>
                                Brak recenzji dla tego produktu. Bądź pierwszy i
                                napisz recenzję!
                            </p>
                        </div>
                    )}

                    {/* Load More Button */}
                    {visibleReviews < sortedReviews.length && (
                        <div className="load-more-reviews-container">
                            <button
                                className="load-more-reviews-button"
                                onClick={() =>
                                    setVisibleReviews((prev) => prev + 4)
                                }>
                                Wczytaj więcej opinii
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Product Details Tab */}
            {activeTab === "details" && (
                <div className="product-details-tab">
                    <div className="product-details-content">
                        <h3>Szczegóły produktu</h3>
                        <p>Brak dodatkowych szczegółów produktu</p>
                    </div>
                </div>
            )}

            {/* FAQs Tab */}
            {activeTab === "faqs" && (
                <div className="product-faqs-tab">
                    <div className="product-faqs-content">
                        <h3>Często zadawane pytania</h3>
                        <p>
                            Brak dostępnych pytań i odpowiedzi dla tego
                            produktu.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}

