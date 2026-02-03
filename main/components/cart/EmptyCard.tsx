import Link from "next/link";
import Header from "../Header";
import Footer from "../Footer";

export function EmptyCart() {
    return (
        <>
            <Header />
            <div className="checkout-page">
                <div className="checkout-page-container">
                    <div className="checkout-empty">
                        <h2>Twój koszyk jest pusty</h2>
                        <p>Dodaj produkty do koszyka, aby kontynuować.</p>
                        <Link
                            href="/products"
                            className="checkout-empty-button">
                            Przejdź do sklepu
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

