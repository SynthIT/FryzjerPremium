import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getOrderByNumerZamowienia } from "@/lib/crud/orders/orders";
import { Courses } from "@/lib/types/coursesTypes";
import Link from "next/link";

export default async function OrderPage({ params }: { params: Promise<{ nrzam: string }> }) {
    const { nrzam } = await params;
    const order = await getOrderByNumerZamowienia(nrzam);
    return (
        <>
            <Header />
            <div className="max-w-[1200px] mx-auto pt-[180px] pb-20 px-6 min-h-[calc(100vh-200px)] w-full relative">
                <div className="max-w-[1200px] mx-auto relative z-10  p-12 rounded-3xl border border-white/20 bg-white/60 backdrop-blur-[10px]">
                    <h1 className="text-[32px] font-black bg-gradient-to-br from-black via-[#3d3329] to-black bg-clip-text text-transparent mb-10 pb-5 relative inline-block w-full ">Zamówienie: {order?.numer_zamowienia}</h1>
                    <p className="text-[17px] leading-[1.9] text-gray-700 [&_p]:mb-7 [&_p:last-child]:mb-0 [&_h2]:text-[32px] [&_h2]:font-bold [&_h2]:bg-gradient-to-br [&_h2]:from-black [&_h2]:to-[#3d3329] [&_h2]:bg-clip-text [&_h2]:text-transparent [&_h2]:mt-12 [&_h2]:mb-5 [&_h2]:pb-3 [&_strong]:font-bold [&_strong]:text-black [&_a]:text-[#D2B79B] [&_a]:no-underline [&_a:hover]:text-[#b89a7f]">Status: {order?.status}</p>
                    <p className="text-[17px] leading-[1.9] text-gray-700 [&_p]:mb-7 [&_p:last-child]:mb-0 [&_h2]:text-[32px] [&_h2]:font-bold [&_h2]:bg-gradient-to-br [&_h2]:from-black [&_h2]:to-[#3d3329] [&_h2]:bg-clip-text [&_h2]:text-transparent [&_h2]:mt-12 [&_h2]:mb-5 [&_h2]:pb-3 [&_strong]:font-bold [&_strong]:text-black [&_a]:text-[#D2B79B] [&_a]:no-underline [&_a:hover]:text-[#b89a7f]">Data zamówienia: {order?.data_zamowienia?.toISOString()}</p>
                    <p className="text-[17px] leading-[1.9] text-gray-700 [&_p]:mb-7 [&_p:last-child]:mb-0 [&_h2]:text-[32px] [&_h2]:font-bold [&_h2]:bg-gradient-to-br [&_h2]:from-black [&_h2]:to-[#3d3329] [&_h2]:bg-clip-text [&_h2]:text-transparent [&_h2]:mt-12 [&_h2]:mb-5 [&_h2]:pb-3 [&_strong]:font-bold [&_strong]:text-black [&_a]:text-[#D2B79B] [&_a]:no-underline [&_a:hover]:text-[#b89a7f]">Data wysłania: {order?.data_wyslania?.toISOString()}</p>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="col-span-1">
                            <h2 className="text-xl text-gray-900 font-bold">Produkty</h2>
                        </div>
                        <div className="col-span-1">
                            <h2 className="text-xl text-gray-900 font-bold">Kursy</h2>
                            <div className="flex flex-col gap-4">
                                <table className="w-full border-2 border-gray-200 rounded-lg p-2 m-2">
                                    <thead>
                                        <tr className="bg-gray-300 ">
                                            <th className="text-left text-gray-900 p-2">Nazwa</th>
                                            <th className="text-left text-gray-900 p-2">Ilość</th>
                                            <th className="text-left text-gray-900 p-2">Cena</th>
                                            <th className="text-left text-gray-900 p-2">Suma</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order?.kursy.map((course) => {
                                            const poz = course.pozycja as Courses;
                                            return (
                                                <tr key={poz._id}>
                                                    <td className="text-sm text-gray-700 p-2"><Link href={`/kursy/${poz.slug}`}>{poz.nazwa}</Link></td>
                                                    <td className="text-sm text-gray-700 p-2">{course.ilosc}</td>
                                                    <td className="text-sm text-gray-700 p-2">{(course.cena * (1 + (poz.vat / 100))).toFixed(2) + " zł"}</td>
                                                    <td className="text-sm text-gray-700 p-2">{((course.cena * (1 + (poz.vat / 100))) * course.ilosc).toFixed(2) + " zł"}</td>
                                                </tr>)
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div >
            <Footer />
        </>
    )
}
