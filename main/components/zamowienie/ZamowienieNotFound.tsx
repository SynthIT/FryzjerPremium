import Link from "next/link";
import StorefrontShell from "@/components/layout/StorefrontShell";

export default function ZamowienieNotFound({ nrzam }: { nrzam: string }) {
    return (
        <StorefrontShell>
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
                <h1 className="text-4xl font-bold font-black bg-gradient-to-br from-black via-[#3d3329] to-black bg-clip-text text-transparent">
                    Zamówienie nieznalezione
                </h1>
                <p className="text-gray-700 mt-4">
                    Nie udało się znaleźć zamówienia o numerze {nrzam}.
                </p>
                <Link href="/zamowienia" className="mt-6 text-[#D2B79B] hover:text-[#b89a7f]">
                    Wróć do listy zamówień
                </Link>
            </div>
        </StorefrontShell>
    );
}
