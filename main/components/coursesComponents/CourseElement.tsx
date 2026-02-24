import { Courses } from "@/lib/types/coursesTypes";
import type { Promos } from "@/lib/types/shared";
import { renderStars } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface CourseElementProps {
    course: Courses;
    index: number;
}

export default function CourseElement({ course, index }: CourseElementProps) {
    const getImageSrc = (): string | null => {
        if (course.media && Array.isArray(course.media) && course.media.length > 0) {
            return course.media[0].path || null;
        }
        return null;
    };
    const imageSrc = getImageSrc();
    const imageAlt = course.media?.[0]?.alt || course.nazwa || "Szkolenie";
    const hasPromo = course.promocje && typeof course.promocje === "object" && "procent" in course.promocje;
    const promo = hasPromo ? (course.promocje as Promos) : null;
    const original = course.cena;
    const discounted = promo ? course.cena * ((100 - promo.procent) / 100) : course.cena;

    return (
        <Link
            key={index}
            href={`/courses/${course.slug}`}
            className="group block rounded-xl overflow-hidden border border-[rgba(212,196,176,0.3)] bg-white/60 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#D2B79B]/40 transition-all duration-300"
        >
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                {hasPromo && (
                    <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md bg-[#D2B79B] text-black text-xs font-bold">
                        -{promo!.procent}%
                    </div>
                )}
                {imageSrc ? (
                    <Image src={imageSrc} alt={imageAlt} width={300} height={300} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-gray-500">
                        <span className="text-2xl mb-2">📚</span>
                        <span className="text-sm">{course.nazwa}</span>
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#D2B79B] transition-colors">{course.nazwa}</h3>
                <div className="mb-2">{renderStars(course.ocena || 0)}</div>
                <div className="flex items-baseline gap-2 flex-wrap">
                    {hasPromo ? (
                        <>
                            <span className="text-sm text-gray-500 line-through">{original.toFixed(2)} zł</span>
                            <span className="font-bold text-[#D2B79B]">{discounted.toFixed(2)} zł</span>
                        </>
                    ) : (
                        <span className="font-bold text-gray-900">{original.toFixed(2)} zł</span>
                    )}
                </div>
                {course.firma && typeof course.firma === "object" && "nazwa" in course.firma && (
                    <p className="text-xs text-gray-500 mt-2">Firma: {(course.firma as { nazwa: string }).nazwa}</p>
                )}
            </div>
        </Link>
    );
}
