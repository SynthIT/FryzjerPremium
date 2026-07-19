"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Package, Truck, Loader2, Search } from "lucide-react";
import type {
    ApaczkaCheckoutSelection,
    ApaczkaService,
} from "@/lib/apaczka/types";
import {
    fetchApaczkaPointsCached,
    fetchApaczkaServicesCached,
    prefetchServicePrices,
} from "@/lib/apaczka/sessionCache";

type DeliveryMode = "door" | "point";

type PointRow = {
    id: string;
    name: string;
    foreign_address_id: string;
    address: {
        line1: string;
        postal_code: string;
        city: string;
    };
    open_hours?: string;
    distance?: number;
};

interface DeliverySelectorProps {
    productsTotal: number;
    postalCode?: string;
    city?: string;
    /** Linie produktów do wyceny po wymiarach z DB */
    productLines?: Array<{ product_id?: string; slug?: string; quantity: number }>;
    onChange: (selection: ApaczkaCheckoutSelection | null, feePln: number) => void;
}

function supplierLabel(supplier: string) {
    const map: Record<string, string> = {
        INPOST: "InPost",
        DPD: "DPD",
        POCZTA: "Poczta Polska",
        ORLEN: "Orlen Paczka",
        UPS: "UPS",
    };
    return map[supplier] ?? supplier;
}

function pointsTypeForSupplier(supplier: string): string {
    if (supplier === "INPOST" || supplier === "ORLEN") return "INPOST";
    if (supplier === "POCZTA") return "POCZTA";
    if (supplier === "UPS") return "UPS";
    return "INPOST";
}

export default function DeliverySelector({
    productsTotal,
    postalCode,
    city,
    productLines,
    onChange,
}: DeliverySelectorProps) {
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const [mode, setMode] = useState<DeliveryMode>("door");
    const [services, setServices] = useState<ApaczkaService[]>([]);
    const [dry, setDry] = useState(true);
    const [loadingServices, setLoadingServices] = useState(true);
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
        null,
    );
    /** Ceny PLN dla wszystkich serwisów — widoczne od razu */
    const [pricesByService, setPricesByService] = useState<
        Record<string, number>
    >({});
    const [loadingPrices, setLoadingPrices] = useState(false);

    const [points, setPoints] = useState<PointRow[]>([]);
    const [loadingPoints, setLoadingPoints] = useState(false);
    const [pointQuery, setPointQuery] = useState("");
    const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

    const filteredServices = useMemo(() => {
        return services.filter((s) =>
            mode === "door"
                ? s.door_to_door === "1"
                : s.door_to_point === "1" || s.point_to_point === "1",
        );
    }, [services, mode]);

    const selectedService = useMemo(
        () =>
            filteredServices.find(
                (s) => String(s.service_id) === selectedServiceId,
            ) ?? null,
        [filteredServices, selectedServiceId],
    );

    const selectedPoint = useMemo(
        () =>
            points.find((p) => p.foreign_address_id === selectedPointId) ??
            null,
        [points, selectedPointId],
    );

    // Services — raz na sesję (cache)
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoadingServices(true);
            try {
                const data = await fetchApaczkaServicesCached();
                if (cancelled) return;
                if (data.status === 0 && Array.isArray(data.services)) {
                    setServices(data.services as ApaczkaService[]);
                    setDry(!!data.dry);
                }
            } catch (e) {
                console.error(e);
            } finally {
                if (!cancelled) setLoadingServices(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // Prefetch cen dla widocznych serwisów (cache sesji)
    const productLinesKey = JSON.stringify(productLines ?? []);
    useEffect(() => {
        if (!filteredServices.length) {
            setPricesByService({});
            return;
        }
        let cancelled = false;
        const lines = productLinesKey
            ? (JSON.parse(productLinesKey) as Array<{
                  product_id?: string;
                  slug?: string;
                  quantity: number;
              }>)
            : undefined;
        (async () => {
            setLoadingPrices(true);
            try {
                const prices = await prefetchServicePrices(
                    filteredServices.map((s) => s.service_id),
                    productsTotal,
                    { city, postalCode },
                    lines,
                );
                if (!cancelled) setPricesByService(prices);
            } catch (e) {
                console.error(e);
            } finally {
                if (!cancelled) setLoadingPrices(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [filteredServices, productsTotal, city, postalCode, productLinesKey]);

    // Reset wyboru przy zmianie trybu (ceny zostają w cache)
    useEffect(() => {
        setSelectedServiceId(null);
        setSelectedPointId(null);
        setPoints([]);
        onChangeRef.current(null, 0);
    }, [mode]);

    // Auto-select pierwszy serwis
    useEffect(() => {
        if (!filteredServices.length) return;
        if (
            selectedServiceId &&
            filteredServices.some(
                (s) => String(s.service_id) === selectedServiceId,
            )
        ) {
            return;
        }
        setSelectedServiceId(String(filteredServices[0].service_id));
    }, [filteredServices, selectedServiceId]);

    // Punkty — cache sesji
    useEffect(() => {
        if (mode !== "point" || !selectedService) return;
        let cancelled = false;
        (async () => {
            setLoadingPoints(true);
            try {
                const type = pointsTypeForSupplier(selectedService.supplier);
                const data = await fetchApaczkaPointsCached({
                    type,
                    city,
                    postalCode,
                });
                if (cancelled) return;
                if (data.status === 0 && Array.isArray(data.points)) {
                    setPoints(data.points);
                    setSelectedPointId((prev) => {
                        if (
                            prev &&
                            data.points.some(
                                (p) => p.foreign_address_id === prev,
                            )
                        ) {
                            return prev;
                        }
                        return data.points[0]?.foreign_address_id ?? null;
                    });
                }
            } catch (e) {
                console.error(e);
            } finally {
                if (!cancelled) setLoadingPoints(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [mode, selectedService, city, postalCode]);

    // Propaguj wybór do rodzica (bez dodatkowego fetch — cena z mapy)
    useEffect(() => {
        if (!selectedService) {
            onChangeRef.current(null, 0);
            return;
        }
        if (mode === "point" && !selectedPoint) {
            onChangeRef.current(null, 0);
            return;
        }

        const sid = String(selectedService.service_id);
        const fee = pricesByService[sid];
        if (typeof fee !== "number") {
            // ceny jeszcze się ładują
            return;
        }

        onChangeRef.current(
            {
                service_id: selectedService.service_id,
                service_name: selectedService.name,
                supplier: selectedService.supplier,
                mode,
                foreign_address_id: selectedPoint?.foreign_address_id,
                point_name: selectedPoint?.name,
                point_address: selectedPoint
                    ? `${selectedPoint.address.line1}, ${selectedPoint.address.postal_code} ${selectedPoint.address.city}`
                    : undefined,
                price_gross: fee,
                dry,
            },
            fee,
        );
    }, [
        selectedService,
        selectedPoint,
        mode,
        pricesByService,
        dry,
    ]);

    const visiblePoints = useMemo(() => {
        const q = pointQuery.trim().toLowerCase();
        if (!q) return points;
        return points.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.address.city.toLowerCase().includes(q) ||
                p.address.line1.toLowerCase().includes(q) ||
                p.address.postal_code.includes(q),
        );
    }, [points, pointQuery]);

    const selectService = useCallback((id: string) => {
        setSelectedServiceId(id);
        setSelectedPointId(null);
    }, []);

    if (loadingServices) {
        return (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-6 justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                Ładowanie metod dostawy…
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {dry && (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    Tryb demo Apaczka (bez kluczy API) — ceny i punkty są
                    przykładowe. Wyniki są cache&apos;owane do zamknięcia karty.
                </p>
            )}

            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-gray-100">
                <button
                    type="button"
                    onClick={() => setMode("door")}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                        mode === "door"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                    }`}>
                    <Truck className="h-4 w-4" />
                    Kurier do drzwi
                </button>
                <button
                    type="button"
                    onClick={() => setMode("point")}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                        mode === "point"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                    }`}>
                    <MapPin className="h-4 w-4" />
                    Punkt odbioru
                </button>
            </div>

            <div className="space-y-2">
                {filteredServices.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                        Brak dostępnych serwisów dla tego trybu
                    </p>
                ) : (
                    filteredServices.map((svc) => {
                        const id = String(svc.service_id);
                        const active = selectedServiceId === id;
                        const price = pricesByService[id];
                        const priceReady = typeof price === "number";
                        return (
                            <label
                                key={id}
                                className={`flex cursor-pointer gap-3 rounded-xl border-2 p-4 transition-all ${
                                    active
                                        ? "border-[#D2B79B] bg-[#f0e8dd]/50"
                                        : "border-gray-200 hover:border-gray-300 bg-white"
                                }`}>
                                <input
                                    type="radio"
                                    name="apaczkaService"
                                    className="sr-only"
                                    checked={active}
                                    onChange={() => selectService(id)}
                                />
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EDE0D4] text-[#6b5a48]">
                                    <Package className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <strong className="text-gray-900 block">
                                                {svc.name}
                                            </strong>
                                            <span className="text-xs text-gray-500">
                                                {supplierLabel(svc.supplier)} ·{" "}
                                                {svc.delivery_time}
                                            </span>
                                        </div>
                                        <span className="font-semibold text-[#D2B79B] whitespace-nowrap tabular-nums">
                                            {!priceReady ||
                                            (loadingPrices && !priceReady) ? (
                                                <Loader2 className="h-4 w-4 animate-spin inline" />
                                            ) : (
                                                `${price.toFixed(2)} zł`
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </label>
                        );
                    })
                )}
            </div>

            {mode === "point" && selectedService && (
                <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Wybierz punkt odbioru
                        </h3>
                        {loadingPoints && (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        )}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="search"
                            value={pointQuery}
                            onChange={(e) => setPointQuery(e.target.value)}
                            placeholder="Szukaj po nazwie, mieście, kodzie…"
                            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20"
                        />
                    </div>
                    <div className="max-h-56 overflow-y-auto space-y-2">
                        {visiblePoints.length === 0 && !loadingPoints ? (
                            <p className="text-sm text-gray-500 text-center py-3">
                                Brak punktów — zmień miasto lub kod pocztowy
                            </p>
                        ) : (
                            visiblePoints.map((p) => {
                                const active =
                                    selectedPointId === p.foreign_address_id;
                                return (
                                    <button
                                        type="button"
                                        key={p.foreign_address_id}
                                        onClick={() =>
                                            setSelectedPointId(
                                                p.foreign_address_id,
                                            )
                                        }
                                        className={`w-full text-left rounded-lg border px-3 py-2.5 transition-colors ${
                                            active
                                                ? "border-[#D2B79B] bg-[#f0e8dd]/40"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}>
                                        <div className="font-medium text-sm text-gray-900">
                                            {p.name}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            {p.address.line1},{" "}
                                            {p.address.postal_code}{" "}
                                            {p.address.city}
                                        </div>
                                        {p.open_hours && (
                                            <div className="text-[11px] text-gray-400 mt-0.5">
                                                {p.open_hours}
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
