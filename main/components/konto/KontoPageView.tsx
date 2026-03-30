import MarketingArticleShell from "@/components/site/MarketingArticleShell";

export default function KontoPageView() {
    return (
        <MarketingArticleShell title="Moje konto">
            <h2>Zaloguj się</h2>
            <p>
                Zaloguj się do swojego konta, aby mieć dostęp do historii zamówień, ulubionych produktów
                oraz szybkiego składania zamówień.
            </p>
            <h2>Zarejestruj się</h2>
            <p>
                Nie masz jeszcze konta? Zarejestruj się, aby korzystać z wszystkich funkcji naszego sklepu
                i otrzymywać specjalne oferty.
            </p>
            <h2>Zapomniałeś hasła?</h2>
            <p>
                Jeśli zapomniałeś hasła, możesz je zresetować używając funkcji &quot;Przypomnij
                hasło&quot; na stronie logowania.
            </p>
        </MarketingArticleShell>
    );
}
