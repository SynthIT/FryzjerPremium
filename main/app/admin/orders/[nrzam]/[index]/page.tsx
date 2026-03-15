import { getOrderByNumerZamowienia } from "@/lib/crud/orders/orders";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Courses, Firmy } from "@/lib/types/coursesTypes";
import { CalendarIcon, ClockIcon } from "lucide-react";

export default async function OrderPage({ params }: { params: Promise<{ nrzam: string, index: string }> }) {

    const { nrzam, index } = await params;
    const order = await getOrderByNumerZamowienia(nrzam);
    if (!order) {
        return <div>Order not found</div>;
    }
    const entry = order.kursy[parseInt(index)];
    const kurs = entry.pozycja as Courses;
    if (!entry || !kurs) {
        return notFound();
    }
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Bilet wstępu {parseInt(index) + 1}</h1>
                <Link href={`/admin/orders/${nrzam}`} className="underline border-1 p-2 m-2 rounded-md hover:bg-gray-100 transition-colors text-center">Powrót</Link>
            </div>
            <div>
                <div className="rounded-lg border p-4 justify-between space-x-2 flex flex-col md:flex-row">
                    <Image src={kurs.media[0].path} alt={kurs.nazwa} width={500} height={500} className=" w-full h-1/5 md:w-1/4 md:h-1/2 object-cover border-2 border-gray-300 rounded-md" />
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h2 className="mb-3 text-base font-medium">Dane kursu</h2>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 border-2 border-gray-300 rounded-md p-2">
                            <div className="flex flex-col gap-2">
                                <p className="text-sm text-foreground">Nazwa kursu: {kurs.nazwa}</p>
                                <p className="text-sm text-foreground">Instruktor: {kurs.instruktor} {kurs.firma ? `(${(kurs.firma as Firmy).nazwa})` : ""}</p>
                                <p className="text-sm text-foreground">Poziom: {kurs.poziom}</p>
                                <p className="text-sm text-foreground">Liczba lekcji: {kurs.liczbaLekcji}</p>
                                <p className="text-sm text-foreground">Cena: {(kurs.cena * (1 + kurs.vat / 100)).toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 border-2 border-gray-300 rounded-md p-2">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                <p className="text-sm text-foreground">Data rozpoczęcia kursu: {kurs.data_rozpoczecia?.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4" />
                                <p className="text-sm text-foreground">Godzina rozpoczęcią kursu: {kurs.godzina_rozpoczecia!} godzin</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4" />
                                <p className="text-sm text-foreground">Czas trwania kursu: {kurs.czasTrwania!}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}