import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Konto - Fryzjerpremium.pl",
  description: "Zarządzaj swoim kontem",
};

export default function AccountPage() {
  return (
    <>
      <Header />
      <main className="page-container">
        <div className="page-content">
          <h1 className="page-title">Moje konto</h1>
          <div className="page-text">
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
              Jeśli zapomniałeś hasła, możesz je zresetować używając funkcji "Przypomnij hasło" 
              na stronie logowania.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

