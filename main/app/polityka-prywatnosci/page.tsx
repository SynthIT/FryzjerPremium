import StorefrontShell from "@/components/layout/StorefrontShell";
import PolitykaPrywatnosciPageView from "@/components/polityka-prywatnosci/PolitykaPrywatnosciPageView";

export const metadata = {
    title: "Polityka prywatności - Fryzjerpremium.pl",
    description: "Polityka prywatności i ochrony danych osobowych",
};

export default function PrivacyPage() {
    return (
        <StorefrontShell>
            <PolitykaPrywatnosciPageView />
        </StorefrontShell>
    );
}
