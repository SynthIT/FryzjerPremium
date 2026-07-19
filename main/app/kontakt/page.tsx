import StorefrontShell from "@/components/layout/StorefrontShell";
import KontaktPageView from "@/components/kontakt/KontaktPageView";

export const metadata = {
    title: "Kontakt - Fryzjerpremium.pl",
    description: "Skontaktuj się z Antoine Hair Institute",
};

export default function KontaktPage() {
    return (
        <StorefrontShell>
            <KontaktPageView />
        </StorefrontShell>
    );
}
