"use client";

import {
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type RefObject,
    type MutableRefObject,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { getCourses, getProducts } from "@/lib/utils";
import { Products } from "@/lib/types/productTypes";
import { Courses } from "@/lib/types/coursesTypes";

type SearchTab = "produkty" | "kursy";

function parseCoursesPayload(payload: unknown): Courses[] {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload as Courses[];
    if (typeof payload === "string") {
        try {
            const parsed = JSON.parse(payload);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
}

function matchName(name: string | undefined, query: string) {
    return (name ?? "").toLowerCase().includes(query);
}

interface HeaderSearchProps {
    isOpen: boolean;
    onClose: () => void;
    containerClassName?: string;
    containerRef?: RefObject<HTMLDivElement | null>;
    inputRef?: RefObject<HTMLInputElement | null>;
}

export default function HeaderSearch({
    isOpen,
    onClose,
    containerClassName,
    containerRef,
    inputRef,
}: HeaderSearchProps) {
    const router = useRouter();
    const listId = useId();
    const [query, setQuery] = useState("");
    const [tab, setTab] = useState<SearchTab>("produkty");
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [products, setProducts] = useState<Products[]>([]);
    const [courses, setCourses] = useState<Courses[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const localInputRef = useRef<HTMLInputElement>(null);
    const resolvedInputRef = inputRef ?? localInputRef;
    const loadingRef = useRef(false);

    const ensureData = useCallback(async () => {
        if (loaded || loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);
        try {
            const [productsRes, coursesRes] = await Promise.all([
                getProducts(window.location.origin),
                getCourses(),
            ]);
            setProducts(Array.isArray(productsRes?.products) ? productsRes.products : []);
            setCourses(
                parseCoursesPayload(coursesRes?.courses).filter((c) => c.aktywne !== false),
            );
            setLoaded(true);
        } catch {
            setProducts([]);
            setCourses([]);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [loaded]);

    useEffect(() => {
        if (isOpen || query.trim().length >= 1) {
            void ensureData();
        }
    }, [isOpen, query, ensureData]);

    const trimmed = query.trim().toLowerCase();
    const showPanel = open && trimmed.length >= 1;

    const productHits = useMemo(() => {
        if (!trimmed) return [];
        return products.filter((p) => matchName(p.nazwa, trimmed)).slice(0, 8);
    }, [products, trimmed]);

    const courseHits = useMemo(() => {
        if (!trimmed) return [];
        return courses.filter((c) => matchName(c.nazwa, trimmed)).slice(0, 8);
    }, [courses, trimmed]);

    const activeHits = tab === "produkty" ? productHits : courseHits;

    useEffect(() => {
        setActiveIndex(-1);
    }, [tab, trimmed]);

    const closePanel = useCallback(() => {
        setOpen(false);
        setActiveIndex(-1);
    }, []);

    useEffect(() => {
        if (!showPanel) return;
        const onPointerDown = (event: MouseEvent) => {
            const root = containerRef?.current ?? rootRef.current;
            if (root && !root.contains(event.target as Node)) {
                closePanel();
            }
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closePanel();
                resolvedInputRef.current?.blur();
            }
        };
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [showPanel, closePanel, containerRef, resolvedInputRef]);

    const navigateToHit = useCallback(
        (index: number) => {
            const hit = activeHits[index];
            if (!hit) return;
            const href =
                tab === "produkty"
                    ? `/produkt/${(hit as Products).slug}`
                    : `/kursy/${(hit as Courses).slug}`;
            closePanel();
            onClose();
            setQuery("");
            router.push(href);
        },
        [activeHits, closePanel, onClose, router, tab],
    );

    const onKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showPanel) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, activeHits.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            navigateToHit(activeIndex);
        }
    };

    const setRootRef = (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (containerRef) {
            (containerRef as MutableRefObject<HTMLDivElement | null>).current = node;
        }
    };

    return (
        <div ref={setRootRef} className={containerClassName}>
            <form
                role="search"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (activeIndex >= 0) navigateToHit(activeIndex);
                    else if (activeHits[0]) navigateToHit(0);
                }}
                className="relative w-full pl-5 flex flex-row items-center gap-2 rounded-lg border border-[rgba(212,196,176,0.4)] bg-white/80 text-gray-800"
                onClick={(e) => e.stopPropagation()}
            >
                <Search className="w-5 h-5 text-gray-500 shrink-0" aria-hidden />
                <input
                    id="searchbox"
                    ref={resolvedInputRef}
                    type="search"
                    value={query}
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-controls={listId}
                    aria-expanded={showPanel}
                    aria-activedescendant={
                        activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
                    }
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => {
                        void ensureData();
                        if (query.trim()) setOpen(true);
                    }}
                    onKeyDown={onKeyDownInput}
                    placeholder="Wyszukaj produkty lub kursy..."
                    className="w-full pl-2 pr-4 py-2 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D2B79B] rounded-r-lg bg-transparent"
                />

                {showPanel && (
                    <div
                        className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-[rgba(212,196,176,0.35)] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.14)] z-[1200] overflow-hidden"
                        role="listbox"
                        id={listId}
                    >
                        <div className="flex border-b border-[rgba(212,196,176,0.25)]" role="tablist">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={tab === "produkty"}
                                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                                    tab === "produkty"
                                        ? "text-[#1a1a1a] border-b-2 border-[#D2B79B] bg-[#f0e8dd]/50"
                                        : "text-gray-600 hover:bg-gray-50"
                                }`}
                                onClick={() => setTab("produkty")}
                            >
                                Produkty ({productHits.length})
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={tab === "kursy"}
                                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                                    tab === "kursy"
                                        ? "text-[#1a1a1a] border-b-2 border-[#D2B79B] bg-[#f0e8dd]/50"
                                        : "text-gray-600 hover:bg-gray-50"
                                }`}
                                onClick={() => setTab("kursy")}
                            >
                                Kursy ({courseHits.length})
                            </button>
                        </div>

                        <div className="max-h-[320px] overflow-y-auto py-1">
                            {loading && !loaded ? (
                                <p className="px-4 py-3 text-sm text-gray-500">Szukam…</p>
                            ) : activeHits.length === 0 ? (
                                <p className="px-4 py-3 text-sm text-gray-500">
                                    Brak wyników w zakładce{" "}
                                    {tab === "produkty" ? "Produkty" : "Kursy"}.
                                </p>
                            ) : tab === "produkty" ? (
                                productHits.map((product, index) => (
                                    <Link
                                        key={product.slug ?? index}
                                        id={`${listId}-option-${index}`}
                                        role="option"
                                        aria-selected={activeIndex === index}
                                        href={`/produkt/${product.slug}`}
                                        className={`flex items-center gap-3 px-4 py-2.5 text-sm text-gray-800 hover:bg-[#f0e8dd] ${
                                            activeIndex === index ? "bg-[#f0e8dd]" : ""
                                        }`}
                                        onClick={() => {
                                            closePanel();
                                            onClose();
                                            setQuery("");
                                        }}
                                        onMouseEnter={() => setActiveIndex(index)}
                                    >
                                        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 shrink-0">
                                            {product.media?.[0]?.path ? (
                                                <Image
                                                    src={product.media[0].path}
                                                    alt=""
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : null}
                                        </div>
                                        <span className="line-clamp-2">{product.nazwa}</span>
                                    </Link>
                                ))
                            ) : (
                                courseHits.map((course, index) => (
                                    <Link
                                        key={course.slug ?? index}
                                        id={`${listId}-option-${index}`}
                                        role="option"
                                        aria-selected={activeIndex === index}
                                        href={`/kursy/${course.slug}`}
                                        className={`flex items-center gap-3 px-4 py-2.5 text-sm text-gray-800 hover:bg-[#f0e8dd] ${
                                            activeIndex === index ? "bg-[#f0e8dd]" : ""
                                        }`}
                                        onClick={() => {
                                            closePanel();
                                            onClose();
                                            setQuery("");
                                        }}
                                        onMouseEnter={() => setActiveIndex(index)}
                                    >
                                        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 shrink-0">
                                            {course.media?.[0]?.path ? (
                                                <Image
                                                    src={course.media[0].path}
                                                    alt=""
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : null}
                                        </div>
                                        <span className="line-clamp-2">{course.nazwa}</span>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
