'use client';
import { useState, useEffect } from "react";
import { OrderList } from "@/lib/types/userTypes";
import { Courses } from "@/lib/types/coursesTypes";

const clicks = new Map<number, number>();

export default function KorektorPage({ params }: { params: { nrzam: string } }) {
    const [order, setOrder] = useState<OrderList | null>(null);
    const [selectedToEdit, setSelectedToEdit] = useState<number | null>(null);
    useEffect(() => {
        const fetchOrder = async () => {
            const { nrzam } = await params;
            const order = await fetch(`/admin/api/v1/orders?nrzam=${nrzam}`).then((res) => res.json()).then((data) => data.order);
            if (order) {
                setOrder(order as OrderList);
            }
        }
        fetchOrder();
    }, [params]);

    const handleClick = (index: number) => {
        if (!clicks.get(index)) {
            clicks.set(index, 1);
            setSelectedToEdit(null);
            return;
        } else {
            clicks.set(index, clicks.get(index)! + 1);
        }
        if (clicks.get(index)! == 2) {
            clicks.clear();
            setSelectedToEdit(index);
            clicks.set(index, 0);
            return;
        }
    }

    const handleChange = (index: number, ilosc: number) => {
        setOrder((prev) => {
            if (!prev) {
                return null;
            }
            const newOrder = { ...prev };
            if (newOrder.kursy) {
                newOrder.kursy[index].ilosc = ilosc;
            }
            return newOrder;
        });
    };

    if (!order) {
        return <div>Order not found</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Dodaj fakturę korygującą</h1>
            </div>
            <div>
                <table className="table-auto w-full border-2 border-gray-300 rounded-md">
                    <thead className="text-left">
                        <tr className="border-b border-gray-300">
                            <th>Lp.</th>
                            <th>Nazwa kursu</th>
                            <th>Ilość</th>
                            <th>Cena</th>
                            <th>Suma</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.kursy.map((kurs, index) => {
                            const pozycja = kurs.pozycja as Courses;
                            if (selectedToEdit === index) {
                                return (
                                    <tr key={index} className="border-b border-gray-300">
                                        <td className="p-2 m-2 rounded-md">{index + 1}</td>
                                        <td>{pozycja.nazwa}</td>
                                        <td><input type="number" value={kurs.ilosc} autoFocus={true} onChange={(e) => handleChange(index, parseInt(e.target.value))} /></td>
                                        <td>{pozycja.cena}</td>
                                        <td>{pozycja.cena * kurs.ilosc}</td>
                                    </tr>
                                )
                            }
                            return (
                                <tr key={index} className="border-b border-gray-300">
                                    <td className="p-2 m-2 rounded-md">{index + 1}</td>
                                    <td onClick={() => handleClick(index)}>{pozycja.nazwa}</td>
                                    <td>{kurs.ilosc}</td>
                                    <td>{pozycja.cena}</td>
                                    <td>{pozycja.cena * kurs.ilosc}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}