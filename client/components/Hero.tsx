import Logo from "./Logo";

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] w-full overflow-hidden bg-white text-black">
      {/* Subtle photographic background, softly blended */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2400&auto=format&fit=crop"
          alt="tło"
          className="h-full w-full object-cover opacity-35 grayscale"
        />
      </div>
      {/* Gentle white gradient to keep content readable without harsh fade */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/80 via-white/50 to-white/20" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 pt-24 md:pt-32">
        <Logo variant="hero" />

        <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-black/10 bg-white/90 p-6 shadow-md backdrop-blur">
            <p className="text-xs text-zinc-600">SPRAWDŹ NASZE</p>
            <p className="text-2xl font-bold text-black">KOSMETYKI</p>
            <p className="-mt-1 text-sm text-zinc-600">DOSTĘPNE TERAZ</p>
            <button className="mt-4 rounded-full bg-black px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-zinc-800">
              Odkryj więcej
            </button>
          </div>
          <div className="rounded-xl border border-black/10 bg-white/90 p-6 shadow-md backdrop-blur">
            <p className="text-xs text-zinc-600">ZNAJDŹ</p>
            <p className="text-2xl font-bold text-black">NAJBLIŻSZY SALON</p>
            <button className="mt-4 rounded-full border border-black/40 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-black hover:bg-black hover:text-white">
              Godziny otwarcia
            </button>
          </div>
        </div>
      </div>

      <button className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-black/10 bg-white/70 p-3 text-black shadow hover:bg-white">
        <span className="sr-only">Previous</span>
        ‹
      </button>
      <button className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-black/10 bg-white/70 p-3 text-black shadow hover:bg-white">
        <span className="sr-only">Next</span>
        ›
      </button>
    </section>
  );
}


