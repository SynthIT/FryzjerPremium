import { NextRequest, NextResponse } from "next/server";
import { collectProducts } from "@/lib/crud/products/product";
import { collectOrders } from "@/lib/crud/orders/orders";
import { collectAnalists } from "@/lib/crud/analists/analists";

export async function GET(req: NextRequest) {
    const products = await collectProducts();
    const orders = await collectOrders();
    const analists = await collectAnalists();
    return NextResponse.json({ status: 200, products: products, orders: orders, analists: analists });
}