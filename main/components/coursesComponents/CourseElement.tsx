import { Courses, Promos } from "@/lib/types/coursesTypes.";
import { renderStars } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface CourseElementProps {
    course: Courses;
    index: number;
}

export default function CourseElement({
    course,
    index,
}: CourseElementProps) {
    // Pobierz pierwsze zdjęcie
    const getImageSrc = (): string | null => {
        if (course.media && Array.isArray(course.media) && course.media.length > 0) {
            return course.media[0].path || null;
        }
        return null;
    };

    const imageSrc = getImageSrc();
    const imageAlt = course.media?.[0]?.alt || course.nazwa || "Szkolenie";

    // Oblicz cenę z promocją
    const getPrice = () => {
        if (course.promocje && typeof course.promocje === "object" && "procent" in course.promocje) {
            const promo = course.promocje as Promos;
            const discountedPrice = course.cena * ((100 - promo.procent) / 100);
            return {
                original: course.cena,
                discounted: discountedPrice,
                hasPromo: true,
            };
        }
        return {
            original: course.cena,
            discounted: course.cena,
            hasPromo: false,
        };
    };

    const price = getPrice();

    return (
        <Link
            key={index}
            href={`/courses/${course.slug}`}
            className="product-card-listing course-card-listing">
            <div className="product-image-wrapper-listing course-image-wrapper-listing">
                {price.hasPromo && (
                    <div className="product-discount-badge">
                        -{(course.promocje as Promos).procent}%
                    </div>
                )}
                {imageSrc ? (
                    <Image
                        src={imageSrc}
                        alt={imageAlt}
                        width={300}
                        height={300}
                        className="product-image-listing course-image-listing"
                    />
                ) : (
                    <div className="product-placeholder-listing course-placeholder-listing">
                        <span className="course-icon">📚</span>
                        <span>{course.nazwa}</span>
                    </div>
                )}
            </div>

            <div className="product-info-listing course-info-listing">
                <h3 className="product-name-listing course-name-listing">{course.nazwa}</h3>
                {renderStars(course.ocena || 0)}
                <div className="product-price-listing course-price-listing">
                    {price.hasPromo ? (
                        <>
                            <span className="product-original-price">
                                {price.original.toFixed(2)} zł
                            </span>
                            <span className="product-current-price">
                                {price.discounted.toFixed(2)} zł
                            </span>
                        </>
                    ) : (
                        <span className="product-current-price">
                            {price.original.toFixed(2)} zł
                        </span>
                    )}
                </div>
                {course.firma && typeof course.firma === "object" && "nazwa" in course.firma && (
                    <div className="course-company">
                        <span className="course-company-label">Firma:</span>
                        <span className="course-company-name">{(course.firma as any).nazwa}</span>
                    </div>
                )}
            </div>
        </Link>
    );
}
