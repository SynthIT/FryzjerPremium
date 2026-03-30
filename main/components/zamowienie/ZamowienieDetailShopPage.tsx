import StorefrontShell from "@/components/layout/StorefrontShell";
import OrderListPage from "@/components/orders/OrderListPage";
import { OrderList } from "@/lib/types/orderTypes";

export default function ZamowienieDetailShopPage({ order, redirected }: { order: OrderList, redirected: boolean }) {
    return (
        <StorefrontShell>
            <OrderListPage order={order} redirected={redirected} />
        </StorefrontShell>
    );
}
