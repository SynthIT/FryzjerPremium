'use client';
import { formatLocaleDateTime } from "@/lib/dateFormat";
import { useState, useEffect } from "react";
import { OrderList } from "@/lib/types/userTypes";
import { Courses } from "@/lib/types/coursesTypes";
import { CheckIcon, Pen } from "lucide-react";

const clicks = new Map<number, number>();

export default function KorektorPage({ params }: { params: { nrzam: string } }) {
    const [order, setOrder] = useState<OrderList | null>(null);
    const [copyOrder, setCopyOrder] = useState<OrderList | null>(null);
    const [reason, setReason] = useState<string>("");
    const [selectedToEdit, setSelectedToEdit] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState<string | null>(null);

    const openEditor = (index: number) => {
        setSelectedToEdit(index);
        setEditingValue(String(order?.kursy?.[index]?.ilosc ?? 0));
    };

    useEffect(() => {
        const fetchOrder = async () => {
            const { nrzam } = await params;
            const order = await fetch(`/admin/api/v1/orders?nrzam=${nrzam}`).then((res) => res.json()).then((data) => data.order);
            if (order) {
                const orderData = order as OrderList;
                setOrder(structuredClone(orderData));
                setCopyOrder(structuredClone(orderData));
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
            openEditor(index);
            clicks.set(index, 0);
            return;
        }
    }

    const applyEdit = (index: number) => {
        if (editingValue === null) return;
        const parsed = editingValue.trim() === '' ? 0 : parseInt(editingValue, 10);
        const ilosc = Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
        setOrder((prev) => {
            if (!prev?.kursy) return prev;
            return {
                ...prev,
                kursy: prev.kursy.map((k, i) =>
                    i === index ? { ...k, ilosc } : k
                ),
            };
        });
        setEditingValue(null);
        setSelectedToEdit(null);
    };

    if (!order) {
        return <div>Order not found</div>;
    }

    return (
        <div className="space-y-6 w-full h-full" onClick={() => {
            if (selectedToEdit !== null) {
                applyEdit(selectedToEdit);
            }
        }}>
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Dodaj fakturę korygującą</h1>
                <p>Numer faktury: {order.nr_faktury}</p>
                <p>Data wystawienia: {formatLocaleDateTime(order.data_zamowienia ?? null)}</p>
                <p>Faktura korygująca: FVK/{order.numer_zamowienia}/{order.nr_faktury_kor && order.nr_faktury_kor.length > 0 ? order.nr_faktury_kor.length + 1 : 1}</p>
            </div>
            <div className="flex flex-col gap-2 border-2 border-gray-300 rounded-md p-4">
                <h2 className="text-lg font-semibold tracking-tight">Dane dołączone do faktury</h2>
                <div className="flex flex-row gap-2 justify-between">
                    <div className="flex flex-col gap-2 w-1/2">
                        <p>Imię i nazwisko: {order.dane?.imie} {order.dane?.nazwisko}</p>
                        <p>Email: {order.dane?.email}</p>
                        <p>Telefon: {order.dane?.telefon}</p>
                        <p>Adres: {order.dane?.ulica}  {order.dane?.nr_domu} {order.dane?.nr_lokalu} </p>

                    </div>
                    <div className="flex flex-col gap-2 w-1/2">
                        <p>Kod pocztowy: {order.dane?.kod_pocztowy}</p>
                        <p>Miasto: {order.dane?.miasto}</p>
                        <p>Kraj: {order.dane?.kraj}</p>
                        <p>NIP: {order.dane?.nip}</p>
                    </div>

                </div>
            </div>

            <div>
                <table className="table-auto w-full border-2 border-gray-300 rounded-md">
                    <thead className="text-left">
                        <tr className="border-b border-gray-300">
                            <th>Lp.</th>
                            <th>Nazwa kursu</th>
                            <th>Ilość</th>
                            <th>Cena</th>
                            <th>VAT</th>
                            <th>Cena brutto</th>
                            <th>Suma</th>
                            <th>Suma brutto</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.kursy.map((kurs, index) => {
                            const pozycja = kurs.pozycja as Courses;
                            const oldValue = copyOrder?.kursy?.[index]?.ilosc;
                            if (selectedToEdit === index) {
                                const displayIlosc = editingValue === null
                                    ? kurs.ilosc
                                    : (editingValue === '' ? 0 : (parseInt(editingValue, 10) || 0));
                                return (
                                    <tr key={index} className="border-b border-gray-300">
                                        <td className="p-2 m-2 rounded-md">{index + 1}</td>
                                        <td>{pozycja.nazwa}</td>
                                        <td>
                                            {oldValue} →
                                            <input
                                                className="w-8 text-center ml-3"
                                                type="number"
                                                min="0"
                                                value={editingValue !== null ? editingValue : String(kurs.ilosc)}
                                                autoFocus={true}
                                                onChange={(e) => setEditingValue(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                onBlur={() => applyEdit(index)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        applyEdit(index);
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td>{pozycja.cena} zł</td>
                                        <td>{pozycja.vat} {"%"}</td>
                                        <td>{pozycja.cena * (1 + pozycja.vat / 100)} zł</td>
                                        <td>{pozycja.cena * displayIlosc} zł</td>
                                        <td>{pozycja.cena * displayIlosc * (1 + pozycja.vat / 100)} zł</td>
                                        <td><button type="button" className="bg-green-400 text-white px-1 py-1 rounded-md hover:bg-green-600 hover:cursor-pointer" onClick={(e) => { e.stopPropagation(); applyEdit(index); }}><CheckIcon className="w-4 h-4" /></button></td>
                                    </tr>
                                )
                            }
                            return (
                                <tr key={index} className={kurs.ilosc !== oldValue ? "border-b bg-yellow-100 hover:bg-yellow-200" : "border-b border-gray-300 hover:bg-gray-100"}>
                                    <td className="p-2 m-2 rounded-md">{index + 1}</td>
                                    <td onClick={() => handleClick(index)}>{pozycja.nazwa}</td>
                                    <td>{kurs.ilosc !== oldValue ? <span className="text-red-500">{oldValue} {"→"} {kurs.ilosc}</span> : kurs.ilosc}</td>
                                    <td>{pozycja.cena} zł</td>
                                    <td>{pozycja.vat} {"%"}</td>
                                    <td>{pozycja.cena * (1 + pozycja.vat / 100)} zł</td>
                                    <td>{pozycja.cena * kurs.ilosc} zł</td>
                                    <td>{pozycja.cena * kurs.ilosc * (1 + pozycja.vat / 100)} zł</td>
                                    <td><button type="button" className="bg-blue-300 text-white px-1 py-1 rounded-md hover:bg-blue-400 hover:cursor-pointer" onClick={(e) => { e.stopPropagation(); openEditor(index); }}><Pen className="w-4 h-4" /></button></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <div className="flex flex-col gap-2 border-2 border-gray-300 rounded-md p-4 justify-end">
                <h2 className="text-lg font-semibold tracking-tight">Wynik korekty</h2>
                <div className="flex flex-col gap-2 justify-between">
                    <div className="flex flex-col gap-2 w-1/2">
                        <p>Suma przed korektą (Bez VAT): {(order.kursy.reduce((acc, kurs, index) => acc + (copyOrder?.kursy?.[index]?.ilosc ?? 0) * kurs.cena, 0)).toFixed(2)} zł</p>
                    </div>
                    <div className="flex flex-col gap-2 w-1/2">
                        <p>Suma po korekcie (Bez VAT): {(order.kursy.reduce((acc, kurs) => acc + kurs.ilosc * kurs.cena, 0)).toFixed(2)} zł</p>
                    </div>
                    <div className="flex flex-col gap-2 w-1/2">
                        <p className={order.kursy.reduce((acc, kurs) => acc + kurs.ilosc * kurs.cena, 0) - (order.kursy.reduce((acc, kurs, index) => acc + (copyOrder?.kursy?.[index]?.ilosc ?? 0) * kurs.cena, 0)) > 0 ? "text-green-500" : "text-red-500"}>Różnica: {(order.kursy.reduce((acc, kurs) => acc + kurs.ilosc * kurs.cena, 0) - (order.kursy.reduce((acc, kurs, index) => acc + (copyOrder?.kursy?.[index]?.ilosc ?? 0) * kurs.cena, 0))).toFixed(2)} zł</p>
                    </div>
                </div>

            </div>
            <div className="flex flex-col gap-2 border-2 border-gray-300 rounded-md p-4">
                <h2 className="text-lg font-semibold tracking-tight">Uzasadnienie korekty</h2>
                <textarea className="w-full h-24 border-2 border-gray-300 rounded-md p-2" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <div className="flex justify-end pb-12 mb-12">
                <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={() => {
                    setEditingValue(null);
                    setSelectedToEdit(null);
                }}>
                    Wystaw fakturę korygującą
                </button>
            </div>
        </div>
    );
}