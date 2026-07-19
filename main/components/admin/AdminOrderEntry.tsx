"use client";

import { Courses } from "@/lib/types/coursesTypes";
import { formatLocaleDateTime } from "@/lib/dateFormat";
import { Products } from "@/lib/types/productTypes";
import { OrderList, Users } from "@/lib/types/userTypes";
import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";
import { adminModalOverlay } from "./AdminFormLayout";

interface AdminOrderEntryProps {
    order: OrderList;
    onDeleted?: (numerZamowienia: string) => void;
}

export default function AdminOrderEntry({ order, onDeleted }: AdminOrderEntryProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(
                `/admin/api/v1/orders?nrzam=${encodeURIComponent(order.numer_zamowienia)}`,
                {
                    method: "DELETE",
                    credentials: "include",
                },
            );
            const result = await res.json();
            if (result.status === 0) {
                setShowConfirm(false);
                onDeleted?.(order.numer_zamowienia);
            } else {
                alert(result.error ?? "Nie udało się usunąć zamówienia");
            }
        } catch {
            alert("Błąd podczas usuwania zamówienia");
        } finally {
            setIsDeleting(false);
        }
    };

    const enabledDelete =
        order.status !== "zrealizowane" && order.status !== "w_realizacji";
    const enabledDeleteClasses =
        "text-red-500 hover:text-red-600 border border-red-500 rounded-md p-1 px-2";
    const disabledDeleteClasses =
        "text-gray-500 border border-gray-500 rounded-md p-1 px-2";

    const products = order.produkty
        ? order.produkty
              .slice(0, 4)
              .map((product) => {
                  if (!product.pozycja) return "Produkt został usunięty";
                  return (product.pozycja as Products).nazwa;
              })
              .join(", ") +
          (order.produkty.length > 4
              ? " +" + (order.produkty.length - 4) + " więcej..."
              : "")
        : "Brak produktów";
    const courses = order.kursy
        ? order.kursy
              .slice(0, 4)
              .map((course) => {
                  if (!course.pozycja) return "Kurs został usunięty";
                  return (course.pozycja as Courses).nazwa;
              })
              .join(", ") +
          (order.kursy.length > 4
              ? " +" + (order.kursy.length - 4) + " więcej..."
              : "")
        : "Brak kursów";

    return (
        <>
            <tr className="border-1">
                <td className="text-md p-2 m-2">
                    {formatLocaleDateTime(order.createdAt ?? null)}
                </td>
                <td className="text-md p-2 m-2">{order.numer_zamowienia}</td>
                <td className="text-md p-2 m-2">
                    {order.email ?? (order.user! as Users).email}
                </td>
                <td className="text-md p-2 m-2">{products}</td>
                <td className="text-md p-2 m-2">{courses}</td>
                <td className="text-md p-2 m-2">{order.suma.toFixed(2)} zł </td>
                <td className="text-md p-2 m-2">{order.status}</td>
                <td className="items-center justify-center">
                    <Link
                        href={`/admin/orders/${order.numer_zamowienia}`}
                        className="text-blue-500 hover:text-blue-600 border border-blue-500 rounded-md p-1 px-2 mr-4">
                        Szczegóły
                    </Link>

                    <button
                        disabled={!enabledDelete}
                        onClick={() => setShowConfirm(true)}
                        className={
                            enabledDelete
                                ? enabledDeleteClasses
                                : disabledDeleteClasses
                        }>
                        Usuń
                    </button>
                </td>
            </tr>

            {showConfirm &&
                createPortal(
                    <div
                        className={adminModalOverlay}
                        onClick={() => !isDeleting && setShowConfirm(false)}>
                        <div
                            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4"
                            onClick={(e) => e.stopPropagation()}>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Usunąć zamówienie?
                            </h2>
                            <p className="text-sm text-gray-600">
                                Czy na pewno chcesz usunąć zamówienie{" "}
                                <span className="font-medium">
                                    {order.numer_zamowienia}
                                </span>
                                ? Tej operacji nie można cofnąć.
                            </p>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() => setShowConfirm(false)}
                                    className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50">
                                    Anuluj
                                </button>
                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={handleDelete}
                                    className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                                    {isDeleting ? "Usuwanie..." : "Usuń"}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </>
    );
}
