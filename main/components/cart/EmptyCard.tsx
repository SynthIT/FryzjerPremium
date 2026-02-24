import Link from "next/link";
import Header from "../Header";
import Footer from "../Footer";

export function EmptyCart() {
    return (
        <>
            <Header />
            <div className="min-h-screen pt-[120px] pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[1200px] mx-auto flex flex-col items-center justify-center py-24 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Twój koszyk jest pusty</h2>
                    <p className="text-gray-600 mb-6">Dodaj produkty do koszyka, aby kontynuować.</p>
                    <Link href="/products" className="inline-block px-8 py-3 rounded-xl font-semibold text-black bg-[#D2B79B] hover:bg-[#b89a7f] transition-colors">
                        Przejdź do sklepu
                    </Link>
                </div>
            </div>
            <Footer />
        </>
    );
}

