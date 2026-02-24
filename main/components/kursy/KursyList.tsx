import { Courses } from "@/lib/types/coursesTypes";
import type { Promos } from "@/lib/types/shared";
import { finalPrice } from "@/lib/utils";
import Link from "next/link";

interface KursyListProps {
  courses: Courses[];
}



export default function KursyList({ courses }: KursyListProps) {
  if (!courses.length) return null;

  return (
    <section className="mt-10">
      <h2>Dostępne szkolenia</h2>
      <ul className="list-none pl-0 my-5 space-y-0">
        {courses.map((course) => {
          const shortDesc =
            course.krotkiOpis ||
            (course.opis && course.opis.length > 160
              ? `${course.opis.slice(0, 160)}...`
              : course.opis);
          return (
            <li key={course.slug} className="mb-4 p-0">
              <Link
                href={`/courses/${course.slug}`}
                className="block py-5 px-6 bg-white/50 border border-[rgba(212,196,176,0.3)] rounded-xl text-inherit no-underline transition-all duration-300 hover:bg-white/80 hover:border-primary/50 hover:translate-x-1"
              >
                <span className="block text-xl font-bold text-black mb-2">
                  {course.nazwa}
                </span>
                {shortDesc && (
                  <span className="block text-[15px] leading-relaxed text-gray-700 mb-3">
                    {shortDesc}
                  </span>
                )}
                <span className="text-lg">
                  {course.promocje ? (
                    <>
                      <span className="line-through text-gray-500 mr-2">
                        {finalPrice(course.cena, course.vat, undefined, course.promocje as Promos)} zł
                      </span>
                      <strong>{finalPrice(course.cena, course.vat, undefined, course.promocje as Promos)} zł</strong>
                    </>
                  ) : (
                    <strong>{finalPrice(course.cena, course.vat, undefined, undefined)} zł</strong>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
