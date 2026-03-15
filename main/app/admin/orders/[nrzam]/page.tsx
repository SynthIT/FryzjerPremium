import { getOrderByNumerZamowienia } from "@/lib/crud/orders/orders";
import { getPaymentIntent } from "@/lib/payments/utils";
import { Courses } from "@/lib/types/coursesTypes";
import { Products } from "@/lib/types/productTypes";
import Link from "next/link";

export default async function OrderPage({ params }: { params: Promise<{ nrzam: string }> }) {
    const { nrzam } = await params;
    const order = await getOrderByNumerZamowienia(nrzam);
    const paymentintent = await getPaymentIntent(nrzam);
    if (!paymentintent) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Zamówienie {nrzam}</h1>
                </div>
            </div>
        )
    }
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Zamówienie {nrzam}</h1>
                <p className="text-muted-foreground">Przeglądaj i zarządzaj zamówieniem klienta.</p>
                <div>
                    <Link href={`/admin/orders/${nrzam}/korektor`} className="underline border-1 p-2 m-2 rounded-md hover:bg-gray-100 transition-colors text-center">Dodaj fakturę korygującą</Link>
                </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-lg border p-4">
                    <div className="flex justify-between items-center">
                        <h2 className="mb-3 text-base font-medium">Dane klienta w zamówieniu. </h2>
                        <Link href={`https://dashboard.stripe.com/customers/${paymentintent?.customer}`} target="_blank" className="underline border-1 p-2 m-2 rounded-md hover:bg-gray-100 transition-colors text-center">Przeglądaj użytkownika na Stripe</Link>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <p className="text-sm text-foreground">Imię: {order?.dane?.imie}</p>
                        </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <p className="text-sm text-foreground">Nazwisko: {order?.dane?.nazwisko}</p>
                        </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <p className="text-sm text-foreground">Email: {order?.email}</p>
                        </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <p className="text-sm text-foreground">Telefon: {order?.dane?.telefon}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border p-4">
                    <h2 className="mb-3 text-base font-medium">Dane zamówienia</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <p className="text-sm text-foreground">Data zamówienia: {`${order?.createdAt}`}</p>
                        </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <p className="text-sm text-foreground">Status zamówienia: {order?.status}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border p-4">
                    <h2 className="mb-3 text-base font-medium">Dane płatności</h2>
                    <div className="grid gap-3 sm:grid-cols-2 ">
                        <div className="p-2 m-2">
                            <p className="text-sm text-foreground">Metoda płatności:</p>
                        </div>
                        <div className="p-2 m-2">
                            <Link href={`https://dashboard.stripe.com/payments/${paymentintent?.id}`} target="_blank" className="underline border-1 p-2 m-2 rounded-md hover:bg-gray-100 transition-colors  text-center">Zarządzaj na stronie Stripe</Link>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border p-4">
                    <h2 className="mb-3 text-base font-medium">Zawartość zamówienia</h2>
                    <div className="flex flex-col gap-3">
                        <div className="grid gap-2 w-full">
                            <p className="text-sm text-foreground">Produkty</p>
                            <table className="w-full border-collapse border-2 border-gray-300">
                                <thead>
                                    <tr>
                                        <th className="border-2 border-gray-300">Lp.</th>
                                        <th className="border-2 border-gray-300">Produkt</th>
                                        <th className="border-2 border-gray-300">Ilość</th>
                                        <th className="border-2 border-gray-300">Cena jedn.</th>
                                        <th className="border-2 border-gray-300">Cena całkowita</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order?.produkty?.map((produkt, index) => {
                                        const produktData = produkt.pozycja as Products;
                                        return (
                                            <tr key={produktData._id}>
                                                <td className="border-2 border-gray-300">{index + 1}</td>
                                                <td className="border-2 border-gray-300">{produktData.nazwa}</td>
                                                <td className="border-2 border-gray-300">{produkt.ilosc}</td>
                                                <td className="border-2 border-gray-300">{produktData.cena * (1 + produktData.vat / 100)}</td>
                                                <td className="border-2 border-gray-300">{produktData.cena * produkt.ilosc}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="grid gap-2 w-full">
                            <p className="text-sm text-foreground">Kursy</p>
                            <table className="w-full border-collapse border-2 border-gray-300">
                                <thead>
                                    <tr>
                                        <th className="border-2 border-gray-300">Lp.</th>
                                        <th className="border-2 border-gray-300">Kurs</th>
                                        <th className="border-2 border-gray-300">Ilość</th>
                                        <th className="border-2 border-gray-300">Cena jedn.</th>
                                        <th className="border-2 border-gray-300">Cena całkowita</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order?.kursy?.map((kurs, index) => {
                                        const kursData = kurs.pozycja as Courses;
                                        return (
                                            <tr key={kursData._id}>
                                                <td className="border-2 border-gray-300">{index + 1}</td>
                                                <td className="border-2 border-gray-300">{kursData.nazwa}</td>
                                                <td className="border-2 border-gray-300">{kurs.ilosc}</td>
                                                <td className="border-2 border-gray-300">{kursData.cena * (1 + kursData.vat / 100)}</td>
                                                <td className="border-2 border-gray-300">{(kursData.cena * (1 + kursData.vat / 100)) * kurs.ilosc}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border p-4">
                    <h2 className="mb-3 text-base font-medium">Pliki zamówienia</h2>
                    <div className="flex flex-col gap-3">
                        <table className="w-full border-collapse border-2 border-gray-300">
                            <thead>
                                <tr>
                                    <th className="border-2 border-gray-300">Lp.</th>
                                    <th className="border-2 border-gray-300">Typ</th>
                                    <th className="border-2 border-gray-300">Plik</th>
                                    <th className="border-2 border-gray-300">Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order?.pliki?.map((plik, index) => {
                                    return (
                                        <tr key={index}>
                                            <td className="border-2 border-gray-300">{index + 1}</td>
                                            <td className="border-2 border-gray-300">{plik.typ.charAt(0).toUpperCase() + plik.typ.slice(1)}</td>
                                            <td className="border-2 border-gray-300">{plik.nazwa}</td>
                                            <td className="border-2 border-gray-300">
                                                <Link href={plik.url} target="_blank" className="underline border-1 p-2 m-2 rounded-md hover:bg-gray-100 transition-colors text-center">Pobierz</Link>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}