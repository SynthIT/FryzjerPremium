import MarketingArticleShell from "@/components/site/MarketingArticleShell";

export default function WysylkaPageView() {
    return (
        <MarketingArticleShell title="Wysyłka i dostawa">
            <h2>Koszty dostawy</h2>
            <p>
                Oferujemy różne opcje dostawy dostosowane do Twoich potrzeb. Koszty dostawy są obliczane
                automatycznie podczas składania zamówienia.
            </p>
            <h2>Czas realizacji</h2>
            <p>
                <strong>Wysyłka standardowa:</strong> 3-5 dni roboczych
                <br />
                <strong>Wysyłka ekspresowa:</strong> 1-2 dni robocze
                <br />
                <strong>Odbiór osobisty:</strong> Dostępny w naszym salonie (wcześniejsze umówienie)
            </p>
            <h2>Śledzenie przesyłki</h2>
            <p>
                Po wysłaniu zamówienia otrzymasz numer przesyłki, który pozwoli Ci śledzić status dostawy
                w czasie rzeczywistym.
            </p>
        </MarketingArticleShell>
    );
}
