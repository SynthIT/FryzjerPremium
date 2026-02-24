"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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
                const data = await fetchCourse(slug);
                if (data) {
                    const json = JSON.parse(data);
                    setCourse(json);
                    setSelectedPrice(finalPrice(json.cena, json.vat, undefined, json.promocje as Promos));
                } else {
                    setError("Kurs nie został znaleziony");
                }
            } catch (error) {
                setError("Wystąpił błąd podczas ładowania szkolenia");
                console.error("Błąd podczas ładowania szkolenia:", error);
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
        <div className="min-h-screen bg-[#f8f6f3] pt-[140px]">
            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Breadcrumbs */}
                <nav className="flex flex-wrap items-center gap-1 text-sm text-gray-600 mb-8">
                    <Link href="/">Strona główna</Link>
                    <span>/</span>
                    <Link href="/courses">Szkolenia</Link>
                    <span>/</span>
                    <span>{course.nazwa}</span>
                </nav>

                {/* Main Course Section - Udemy Style */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {/* Left Column - Course Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{course.nazwa}</h1>

                        {/* Subtitle */}
                        <p className="text-gray-600 leading-relaxed">
                            {course.krotkiOpis || (course.opis && course.opis.length > 150
                                ? `${course.opis.substring(0, 150)}...`
                                : course.opis)}
                        </p>

                        {/* Rating and Reviews */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-[#D2B79B]">{course.ocena ? course.ocena.toFixed(1) : "0.0"}</span>
                                {renderStars(course.ocena || 0, 20)}
                            </div>
                            <span className="text-sm text-gray-500">
                                ({course.opinie?.length || 0} {course.opinie?.length === 1 ? 'opinia' : 'opinii'})
                            </span>
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                                <Users className="h-4 w-4" />
                                {Math.floor(Math.random() * 1000) + 100} studentów
                            </span>
                        </div>

                        {/* Instructor/Company */}
                        <div className="text-sm text-gray-600">
                            {course.instruktor && (
                                <>
                                    <span className="font-medium">Instruktor:</span>
                                    <span className="ml-1">{course.instruktor}</span>
                                </>
                            )}
                            {course.firma && typeof course.firma === "object" && "nazwa" in course.firma && (
                                <>
                                    {course.instruktor && <span className="mx-2">•</span>}
                                    <span className="font-medium">Firma:</span>
                                    <span className="ml-1">{(course.firma as Firmy).nazwa}</span>
                                </>
                            )}
                        </div>

                        {/* Course Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex gap-3 p-3 rounded-lg bg-white/60 border border-[rgba(212,196,176,0.3)]">
                                <Clock className="h-5 w-5 shrink-0 text-[#D2B79B]" />
                                <div>
                                    <div className="text-xs text-gray-500">Czas trwania</div>
                                    <div className="font-medium text-gray-900">{course.czasTrwania || "Nie określono"}</div>
                                </div>
                            </div>
                            <div className="flex gap-3 p-3 rounded-lg bg-white/60 border border-[rgba(212,196,176,0.3)]">
                                <PlayCircle className="h-5 w-5 shrink-0 text-[#D2B79B]" />
                                <div>
                                    <div className="text-xs text-gray-500">Lekcje</div>
                                    <div className="font-medium text-gray-900">{course.liczbaLekcji || 0} lekcji</div>
                                </div>
                            </div>
                            <div className="flex gap-3 p-3 rounded-lg bg-white/60 border border-[rgba(212,196,176,0.3)]">
                                <Award className="h-5 w-5 shrink-0 text-[#D2B79B]" />
                                <div>
                                    <div className="text-xs text-gray-500">Poziom</div>
                                    <div className="font-medium text-gray-900">
                                        {course.poziom === "poczatkujacy" ? "Początkujący" :
                                            course.poziom === "sredniozaawansowany" ? "Średniozaawansowany" :
                                                course.poziom === "zaawansowany" ? "Zaawansowany" :
                                                    course.poziom === "wszystkie" ? "Wszystkie poziomy" :
                                                        course.poziom || "Nie określono"}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 p-3 rounded-lg bg-white/60 border border-[rgba(212,196,176,0.3)]">
                                <Globe className="h-5 w-5 shrink-0 text-[#D2B79B]" />
                                <div>
                                    <div className="text-xs text-gray-500">Język</div>
                                    <div className="font-medium text-gray-900">{course.jezyk || "Polski"}</div>
                                </div>
                            </div>
                        </div>

                        {/* What You'll Learn */}
                        <div className="rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Czego się nauczysz</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li><CheckCircle className="h-5 w-5" /> Profesjonalne techniki strzyżenia</li>
                                <li><CheckCircle className="h-5 w-5" /> Praca z różnymi typami włosów</li>
                                <li><CheckCircle className="h-5 w-5" /> Stylizacja i modelowanie</li>
                                <li><CheckCircle className="h-5 w-5" /> Obsługa klienta w salonie</li>
                            </ul>
                        </div>

                        {/* Course Content */}
                        <div className="rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Zawartość szkolenia</h3>
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D2B79B] text-sm font-bold text-black">1</span>
                                    <div>
                                        <div className="font-medium text-gray-900">Wprowadzenie do fryzjerstwa</div>
                                        <div className="text-sm text-gray-500">3 lekcje • 45 min</div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D2B79B] text-sm font-bold text-black">2</span>
                                    <div>
                                        <div className="font-medium text-gray-900">Techniki strzyżenia</div>
                                        <div className="text-sm text-gray-500">8 lekcji • 2 godziny</div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D2B79B] text-sm font-bold text-black">3</span>
                                    <div>
                                        <div className="font-medium text-gray-900">Stylizacja i modelowanie</div>
                                        <div className="text-sm text-gray-500">6 lekcji • 1.5 godziny</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Requirements */}
                        <div className="rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Wymagania</h3>
                            <ul className="list-disc list-inside space-y-1 text-gray-700">
                                <li>Podstawowa znajomość narzędzi fryzjerskich</li>
                                <li>Dostęp do podstawowych narzędzi (nożyczki, grzebień)</li>
                                <li>Chęć do nauki i praktyki</li>
                            </ul>
                        </div>

                        {/* Description */}
                        <div className="rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Opis szkolenia</h3>
                            <div className="text-gray-700 leading-relaxed">
                                <p>{course.opis}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Purchase Card (Udemy Style) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 rounded-xl border-2 border-[#D2B79B] bg-white shadow-lg overflow-hidden">
                            <div className="relative aspect-video bg-gray-100">
                                {mainImage ? (
                                    <Image
                                        src={mainImage}
                                        alt={mainImageAlt}
                                        width={400}
                                        height={300}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-5xl">
                                        📚
                                    </div>
                                )}
                                {hasPromo !== null && hasPromo !== undefined && promoPercent! > 0 && (
                                    <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-[#D2B79B] text-black text-sm font-bold">
                                        -{promoPercent}%
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                {hasPromo !== null && hasPromo !== undefined && promoPercent! > 0 ? (
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-gray-500 line-through">{finalPrice(course.cena, course.vat, undefined, undefined)} zł</span>
                                        <span className="text-2xl font-bold text-[#D2B79B]">{finalPrice(course.cena, course.vat, undefined, course.promocje as Promos)} zł</span>
                                    </div>
                                ) : (hasPromo !== null && hasPromo !== undefined && promoPercent! === 0) ? (
                                    <div className="text-2xl font-bold text-gray-900 mb-4">{finalPrice(course.cena, course.vat, undefined, undefined)} zł <sub>Cena za szkolenie</sub><br></br>
                                        <span className="text-sm text-gray-500">{finalPrice(course.cena, course.vat, undefined, course.promocje as Promos)} zł Cena za szkolenie przy zakupie <u>{((course.promocje as Promos).special?.warunek)}</u> </span>
                                    </div>
                                ) : (
                                    <div className="text-2xl font-bold text-gray-900 mb-4">{finalPrice(course.cena, course.vat, undefined, undefined)} zł</div>
                                )}

                                <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
                                    <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
                                    <span>30-dniowa gwarancja zwrotu pieniędzy</span>
                                </div>

                                <div className="mt-6">
                                    <h4 className="font-bold text-gray-900 mb-2">Ten kurs zawiera:</h4>
                                    <ul className="space-y-2 text-sm text-gray-700">
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
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="mt-10">
                    <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-6">
                        <button
                            type="button"
                            onClick={() => setActiveTab("overview")}
                            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === "overview" ? "bg-[#D2B79B] text-black" : "text-gray-600 hover:bg-gray-100"}`}>
                            Przegląd
                        </button>
                        <button
                            onClick={() => setActiveTab("curriculum")}
                            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === "curriculum" ? "bg-[#D2B79B] text-black" : "text-gray-600 hover:bg-gray-100"}`}>
                            Program
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("reviews")}
                            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === "reviews" ? "bg-[#D2B79B] text-black" : "text-gray-600 hover:bg-gray-100"}`}>
                            Opinie ({course.opinie?.length || 0})
                        </button>
                    </div>

                    <div className="rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60 p-6">
                        {activeTab === "overview" && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-900">O tym szkoleniu</h3>
                                <p className="text-gray-700 leading-relaxed">{course.opis}</p>

                                {course.firma && typeof course.firma === "object" && "nazwa" in course.firma && (
                                    <div className="pt-4 border-t border-gray-200">
                                        <h4 className="font-bold text-gray-900">Instruktor</h4>
                                        <p className="text-gray-600">{(course.firma as Firmy).nazwa}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "curriculum" && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-900">Program szkolenia</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Rozdział 1: Wprowadzenie</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-2 py-2 border-b border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <PlayCircle className="h-4 w-4 text-[#D2B79B]" />
                                                    <span className="text-gray-700">Lekcja 1: Wprowadzenie do kursu</span>
                                                </div>
                                                <span className="text-sm text-gray-500">15:30</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-2 py-2 border-b border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <PlayCircle className="h-4 w-4 text-[#D2B79B]" />
                                                    <span className="text-gray-700">Lekcja 2: Podstawowe narzędzia</span>
                                                </div>
                                                <span className="text-sm text-gray-500">20:45</span>
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
