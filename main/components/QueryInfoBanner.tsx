"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function QueryInfoBanner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const info = searchParams.get("info");
    const [visible, setVisible] = useState(!!info);

    useEffect(() => {
        if (info) setVisible(true);
    }, [info]);

    if (!visible || !info) return null;

    const close = () => {
        setVisible(false);
        const next = new URLSearchParams(searchParams);
        next.delete("info");
        const q = next.toString();
        router.replace(q ? `/?${q}` : "/", { scroll: false });
    };

    return (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-3 text-center text-sm flex items-center justify-center gap-4 flex-wrap">
            <span>{decodeURIComponent(info)}</span>
            <button
                type="button"
                onClick={close}
                className="shrink-0 underline font-medium hover:no-underline"
            >
                Zamknij
            </button>
        </div>
    );
}
