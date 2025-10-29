import { ArrowUpRight, Package, ShoppingBag, DollarSign, Wallet } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Panel główny</h1>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Wszystkie zamówienia" value="1 284" delta="12%" icon={<ShoppingBag className="h-5 w-5" />} />
        <KpiCard title="Liczba produktów" value="468" delta="3%" icon={<Package className="h-5 w-5" />} />
        <KpiCard title="Przychód" value="82 140 zł" delta="9%" icon={<DollarSign className="h-5 w-5" />} />
        <KpiCard title="Sprzedaż" value="3 721" delta="6%" icon={<Wallet className="h-5 w-5" />} />
      </section>
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border p-4 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-medium">Przychód w czasie</h2>
            <button className="text-sm text-muted-foreground transition-colors hover:text-foreground">Miesięcznie</button>
          </div>
          <div className="h-64 w-full rounded-md bg-linear-to-br from-purple-500/10 to-pink-500/10" />
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 text-base font-medium">Najlepsze produkty</h2>
          <ul className="space-y-3 text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex items-center justify-between">
                <span className="truncate">Product #{i + 1}</span>
                <span className="text-muted-foreground">{(1000 - i * 120).toLocaleString()} zł</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-medium">Ostatnie zamówienia</h2>
            <a className="text-sm text-muted-foreground transition-colors hover:text-foreground" href="/orders">Zobacz wszystkie</a>
          </div>
          <div className="h-64 w-full rounded-md bg-muted" />
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 text-base font-medium">Alerty magazynowe</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border p-3">
              <div className="mb-1 text-sm font-medium">Niski stan</div>
              <div className="text-2xl font-semibold">17</div>
              <a className="mt-2 inline-flex items-center text-xs text-muted-foreground transition-colors hover:text-foreground" href="/products?stock_lt=10">
                Zobacz produkty <ArrowUpRight className="ml-1 h-4 w-4" />
              </a>
            </div>
            <div className="rounded-md border p-3">
              <div className="mb-1 text-sm font-medium">Brak na stanie</div>
              <div className="text-2xl font-semibold">5</div>
              <a className="mt-2 inline-flex items-center text-xs text-muted-foreground transition-colors hover:text-foreground" href="/products?stock=0">
                Zobacz produkty <ArrowUpRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function KpiCard({ title, value, delta, icon }: { title: string; value: string; delta: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-4 transition-colors">
      <div className="flex items-center justify-between">
        <div className="rounded-md bg-linear-to-br from-purple-500/15 to-pink-500/15 p-2 text-purple-600 shadow-sm dark:text-purple-300">
          {icon}
        </div>
        <span className="text-xs text-emerald-600 dark:text-emerald-400">+{delta}</span>
      </div>
      <div className="mt-4 text-2xl font-semibold">{value}</div>
      <div className="text-sm text-muted-foreground">{title}</div>
    </div>
  )
}


