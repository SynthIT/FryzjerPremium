"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import "@/app/globals.css";
import { finalPrice, getCourses, renderStars } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { Courses, Firmy } from "@/lib/types/coursesTypes";
import { Promos, Opinie } from "@/lib/types/shared";
import ReviewTabs from "./productComponents/ReviewTabs";
import { Clock, Users, Award, Globe, CheckCircle, PlayCircle } from "lucide-react";

interface CoursePageProps {
    courseSlug?: string;
}

export default function CoursePage({ courseSlug }: CoursePageProps) {
    const [course, setCourse] = useState<Courses | null>(null);
    const [selectedPrice, setSelectedPrice] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<"overview" | "curriculum" | "reviews">("overview");
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewForm, setReviewForm] = useState<Opinie>({
        ocena: 0,
        uzytkownik: "",
        tresc: "",
    });

    const fetchCourse = useCallback(async (slug: string) => {
        const data = await getCourses(slug);
        return data;
    }, []);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function getCourse(slug: string) {
            try {
                setError(null);
                console.log("Pobieranie kursu dla slug:", slug);
                const data = await fetchCourse(slug);
                console.log("Otrzymane dane:", data);
                if (data) {
                    setCourse(data);
                    setSelectedPrice(finalPrice(data.cena, data.vat, undefined, data.promocje as Promos));
                } else {
                    setError("Kurs nie został znaleziony");
                }
            } catch (error) {
                console.error("Błąd podczas pobierania kursu:", error);
                setError("Wystąpił błąd podczas ładowania szkolenia");
            }
        }
        if (courseSlug) {
            getCourse(courseSlug);
        }
    }, [courseSlug, fetchCourse]);

    const handleQuantityChange = useCallback((delta: number) => {
        setQuantity((prev) => Math.max(1, prev + delta));
    }, []);

    const { addToCart } = useCart();

    const handleAddToCart = useCallback(() => {
        if (course?.aktywne !== false) {
            console.log("Dodawanie szkolenia do koszyka:", course);
            // TODO: Implementacja dodawania szkolenia do koszyka
            // addToCart(course, quantity, selectedPrice);
        }
    }, [course]);

    if (!course && !error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Ładowanie szkolenia...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold mb-2">Błąd</h2>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Link
                        href="/products/szkolenia"
                        className="text-primary hover:underline">
                        Wróć do listy szkoleń
                    </Link>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold mb-2">Błąd</h2>
                    <p className="text-muted-foreground mb-4">Kurs nie został znaleziony</p>
                </div>
            </div>
        );
    }


    const images = course.media && Array.isArray(course.media) ? course.media : [];
    const mainImage = images[0]?.path || "";
    const mainImageAlt = images[0]?.alt || course.nazwa;
    const hasPromo = course.promocje && typeof course.promocje === "object" && "procent" in course.promocje;
    const promoPercent = hasPromo ? (course.promocje as Promos).procent : 0;

    return (
        <div className="course-page-container" style={{ paddingTop: "140px" }}>
            <div className="course-page-content">
                {/* Breadcrumbs */}
                <nav className="breadcrumbs">
                    <Link href="/">Strona główna</Link>
                    <span>/</span>
                    <Link href="/courses">Szkolenia</Link>
                    <span>/</span>
                    <span>{course.nazwa}</span>
                </nav>

                {/* Main Course Section - Udemy Style */}
                <div className="course-main-section">
                    {/* Left Column - Course Info */}
                    <div className="course-info-column">
                        <h1 className="course-title">{course.nazwa}</h1>

                        {/* Subtitle */}
                        <p className="course-subtitle">
                            {course.krotkiOpis || (course.opis && course.opis.length > 150
                                ? `${course.opis.substring(0, 150)}...`
                                : course.opis)}
                        </p>

                        {/* Rating and Reviews */}
                        <div className="course-rating-section">
                            <div className="course-rating-badge">
                                <span className="course-rating-number">{course.ocena ? course.ocena.toFixed(1) : "0.0"}</span>
                                {renderStars(course.ocena || 0, 20)}
                            </div>
                            <span className="course-reviews-count">
                                ({course.opinie?.length || 0} {course.opinie?.length === 1 ? 'opinia' : 'opinii'})
                            </span>
                            <span className="course-students-count">
                                <Users className="h-4 w-4" />
                                {Math.floor(Math.random() * 1000) + 100} studentów
                            </span>
                        </div>

                        {/* Instructor/Company */}
                        <div className="course-instructor-section">
                            {course.instruktor && (
                                <>
                                    <span className="course-instructor-label">Instruktor:</span>
                                    <span className="course-instructor-name">{course.instruktor}</span>
                                </>
                            )}
                            {course.firma && typeof course.firma === "object" && "nazwa" in course.firma && (
                                <>
                                    {course.instruktor && <span className="mx-2">•</span>}
                                    <span className="course-instructor-label">Firma:</span>
                                    <span className="course-instructor-name">{(course.firma as Firmy).nazwa}</span>
                                </>
                            )}
                        </div>

                        {/* Course Stats */}
                        <div className="course-stats-grid">
                            <div className="course-stat-item">
                                <Clock className="h-5 w-5" />
                                <div>
                                    <div className="course-stat-label">Czas trwania</div>
                                    <div className="course-stat-value">{course.czasTrwania || "Nie określono"}</div>
                                </div>
                            </div>
                            <div className="course-stat-item">
                                <PlayCircle className="h-5 w-5" />
                                <div>
                                    <div className="course-stat-label">Lekcje</div>
                                    <div className="course-stat-value">{course.liczbaLekcji || 0} lekcji</div>
                                </div>
                            </div>
                            <div className="course-stat-item">
                                <Award className="h-5 w-5" />
                                <div>
                                    <div className="course-stat-label">Poziom</div>
                                    <div className="course-stat-value">
                                        {course.poziom === "poczatkujacy" ? "Początkujący" :
                                            course.poziom === "sredniozaawansowany" ? "Średniozaawansowany" :
                                                course.poziom === "zaawansowany" ? "Zaawansowany" :
                                                    course.poziom === "wszystkie" ? "Wszystkie poziomy" :
                                                        course.poziom || "Nie określono"}
                                    </div>
                                </div>
                            </div>
                            <div className="course-stat-item">
                                <Globe className="h-5 w-5" />
                                <div>
                                    <div className="course-stat-label">Język</div>
                                    <div className="course-stat-value">{course.jezyk || "Polski"}</div>
                                </div>
                            </div>
                        </div>

                        {/* What You'll Learn */}
                        <div className="course-what-you-learn">
                            <h3 className="course-section-title">Czego się nauczysz</h3>
                            <ul className="course-learn-list">
                                <li><CheckCircle className="h-5 w-5" /> Profesjonalne techniki strzyżenia</li>
                                <li><CheckCircle className="h-5 w-5" /> Praca z różnymi typami włosów</li>
                                <li><CheckCircle className="h-5 w-5" /> Stylizacja i modelowanie</li>
                                <li><CheckCircle className="h-5 w-5" /> Obsługa klienta w salonie</li>
                            </ul>
                        </div>

                        {/* Course Content */}
                        <div className="course-content-section">
                            <h3 className="course-section-title">Zawartość szkolenia</h3>
                            <div className="course-content-list">
                                <div className="course-content-item">
                                    <span className="course-content-number">1</span>
                                    <div className="course-content-details">
                                        <div className="course-content-title">Wprowadzenie do fryzjerstwa</div>
                                        <div className="course-content-meta">3 lekcje • 45 min</div>
                                    </div>
                                </div>
                                <div className="course-content-item">
                                    <span className="course-content-number">2</span>
                                    <div className="course-content-details">
                                        <div className="course-content-title">Techniki strzyżenia</div>
                                        <div className="course-content-meta">8 lekcji • 2 godziny</div>
                                    </div>
                                </div>
                                <div className="course-content-item">
                                    <span className="course-content-number">3</span>
                                    <div className="course-content-details">
                                        <div className="course-content-title">Stylizacja i modelowanie</div>
                                        <div className="course-content-meta">6 lekcji • 1.5 godziny</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Requirements */}
                        <div className="course-requirements">
                            <h3 className="course-section-title">Wymagania</h3>
                            <ul className="course-requirements-list">
                                <li>Podstawowa znajomość narzędzi fryzjerskich</li>
                                <li>Dostęp do podstawowych narzędzi (nożyczki, grzebień)</li>
                                <li>Chęć do nauki i praktyki</li>
                            </ul>
                        </div>

                        {/* Description */}
                        <div className="course-description-section">
                            <h3 className="course-section-title">Opis szkolenia</h3>
                            <div className="course-description-content">
                                <p>{course.opis}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Purchase Card (Udemy Style) */}
                    <div className="course-purchase-card">
                        <div className="course-purchase-image-wrapper">
                            {mainImage ? (
                                <Image
                                    src={mainImage}
                                    alt={mainImageAlt}
                                    width={400}
                                    height={300}
                                    className="course-purchase-image"
                                />
                            ) : (
                                <div className="course-purchase-placeholder">
                                    <span className="course-icon-large">📚</span>
                                </div>
                            )}
                            {hasPromo && (
                                <div className="course-promo-badge">
                                    -{promoPercent}%
                                </div>
                            )}
                        </div>

                        <div className="course-purchase-price-section">
                            {hasPromo ? (
                                <>
                                    <div className="course-price-original">{course.cena.toFixed(2)} zł</div>
                                    <div className="course-price-current">{selectedPrice} zł</div>
                                </>
                            ) : (
                                <div className="course-price-current-large">{course.cena.toFixed(2)} zł</div>
                            )}
                        </div>

                        <div className="course-purchase-actions">
                            <button
                                onClick={handleAddToCart}
                                className="course-add-to-cart-btn">
                                Dodaj do koszyka
                            </button>
                            <button className="course-buy-now-btn">
                                Kup teraz
                            </button>
                        </div>

                        <div className="course-purchase-guarantee">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span>30-dniowa gwarancja zwrotu pieniędzy</span>
                        </div>

                        <div className="course-purchase-includes">
                            <h4 className="course-purchase-includes-title">Ten kurs zawiera:</h4>
                            <ul className="course-purchase-includes-list">
                                {course.czasTrwania && (
                                    <li><CheckCircle className="h-4 w-4" /> {course.czasTrwania} materiału</li>
                                )}
                                {course.liczbaLekcji && course.liczbaLekcji > 0 && (
                                    <li><CheckCircle className="h-4 w-4" /> {course.liczbaLekcji} lekcji</li>
                                )}
                                {course.certyfikat && (
                                    <li><CheckCircle className="h-4 w-4" /> Certyfikat ukończenia</li>
                                )}
                                <li><CheckCircle className="h-4 w-4" /> Dożywotni dostęp</li>
                                <li><CheckCircle className="h-4 w-4" /> Materiały do pobrania</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="course-tabs-section">
                    <div className="course-tabs">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`course-tab ${activeTab === "overview" ? "course-tab-active" : ""}`}>
                            Przegląd
                        </button>
                        <button
                            onClick={() => setActiveTab("curriculum")}
                            className={`course-tab ${activeTab === "curriculum" ? "course-tab-active" : ""}`}>
                            Program
                        </button>
                        <button
                            onClick={() => setActiveTab("reviews")}
                            className={`course-tab ${activeTab === "reviews" ? "course-tab-active" : ""}`}>
                            Opinie ({course.opinie?.length || 0})
                        </button>
                    </div>

                    <div className="course-tab-content">
                        {activeTab === "overview" && (
                            <div className="course-overview-content">
                                <h3>O tym szkoleniu</h3>
                                <p>{course.opis}</p>

                                {course.firma && typeof course.firma === "object" && "nazwa" in course.firma && (
                                    <div className="course-instructor-details">
                                        <h4>Instruktor</h4>
                                        <p>{(course.firma as Firmy).nazwa}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "curriculum" && (
                            <div className="course-curriculum-content">
                                <h3>Program szkolenia</h3>
                                <div className="course-curriculum-sections">
                                    <div className="course-curriculum-section">
                                        <h4>Rozdział 1: Wprowadzenie</h4>
                                        <div className="course-curriculum-lessons">
                                            <div className="course-curriculum-lesson">
                                                <PlayCircle className="h-4 w-4" />
                                                <span>Lekcja 1: Wprowadzenie do kursu</span>
                                                <span className="lesson-duration">15:30</span>
                                            </div>
                                            <div className="course-curriculum-lesson">
                                                <PlayCircle className="h-4 w-4" />
                                                <span>Lekcja 2: Podstawowe narzędzia</span>
                                                <span className="lesson-duration">20:45</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <ReviewTabs
                            activeTab={activeTab}
                            product={course as Courses}
                            setShowReviewModal={setShowReviewModal}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
