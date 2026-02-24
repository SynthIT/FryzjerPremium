"use client";

import { useState, useEffect } from "react";
import { Courses } from "@/lib/types/coursesTypes";
import KursyList from "./KursyList";
import KursyContactSection from "./KursyContactSection";

export default function KursyPageContent() {
  const [courses, setCourses] = useState<Courses[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchCourses() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/v1/courses", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (data.status === 0 && Array.isArray(data.courses)) {
          setCourses(data.courses);
        } else if (data.courses && Array.isArray(data.courses)) {
          setCourses(data.courses);
        } else {
          setCourses([]);
        }
      } catch (e) {
        if (!cancelled) {
          setError("Błąd podczas ładowania listy kursów.");
          setCourses([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCourses();
    return () => {
      cancelled = true;
    };
  }, []);

  const pageText =
    "text-[17px] leading-[1.9] text-gray-700 [&_p]:mb-7 [&_p:last-child]:mb-0 [&_h2]:text-[32px] [&_h2]:font-bold [&_h2]:bg-gradient-to-br [&_h2]:from-black [&_h2]:to-[#3d3329] [&_h2]:bg-clip-text [&_h2]:text-transparent [&_h2]:mt-12 [&_h2]:mb-5 [&_h2]:pb-3 [&_h2]:relative [&_h2:hover]:translate-x-1 [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:text-black [&_h3]:mt-10 [&_h3]:mb-4 [&_strong]:font-bold [&_strong]:text-black [&_a]:text-[#D2B79B] [&_a]:no-underline [&_a]:border-b [&_a:hover]:text-[#b89a7f]";

  return (
    <div className={pageText}>
      <p>
        Poniżej znajdziesz aktualną ofertę szkoleń. Wybierz kurs dopasowany do
        swoich potrzeb — w razie wątpliwości skorzystaj z kontaktu poniżej.
      </p>

      {loading && (
        <p className="mt-6 text-gray-500">
          Ładowanie listy szkoleń...
        </p>
      )}

      {error && (
        <p className="mt-6 text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && courses.length > 0 && (
        <KursyList courses={courses} />
      )}

      {!loading && !error && courses.length === 0 && (
        <section className="mt-10">
          <h2>Brak dostępnych szkoleń</h2>
          <p>
            W tej chwili nie mamy w ofercie aktywnych kursów. Skontaktuj się z
            nami — chętnie poinformujemy o planowanych szkoleniach lub
            przygotujemy ofertę indywidualną.
          </p>
        </section>
      )}

      <KursyContactSection />
    </div>
  );
}
