import { NextRequest, NextResponse } from "next/server";
import { collectProducts } from "@/lib/crud/products/product";
import { collectOrders } from "@/lib/crud/orders/orders";
import { collectAnalists } from "@/lib/crud/analists/analists";
import { OrderList } from "@/lib/types/userTypes";

export async function GET(req: NextRequest) {
    const products = await collectProducts();
    const orders = await collectOrders();
    const analists = await collectAnalists();
    const sortedOrders = JSON.parse(orders).sort((a: OrderList, b: OrderList) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    return NextResponse.json({ status: 200, products: products, orders: JSON.stringify(sortedOrders), analists: analists });
}