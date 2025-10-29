export default function SideTabs() {
  return (
    <>
      <a
        href="#book"
        className="fixed right-0 top-1/3 z-40 -mr-10 rotate-90 rounded-t bg-black px-4 py-2 text-xs font-bold uppercase text-white shadow md:-mr-8"
        style={{ letterSpacing: 1 }}
      >
        Rezerwuj online
      </a>
      <a
        href="#offers"
        className="fixed right-0 top-1/2 z-40 -mr-10 rotate-90 rounded-t bg-black px-4 py-2 text-xs font-bold uppercase text-white shadow md:-mr-8"
        style={{ letterSpacing: 1 }}
      >
        Promocje
      </a>
    </>
  );
}


