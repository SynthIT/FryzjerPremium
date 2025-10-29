"use client";

type LogoProps = {
  variant?: "nav" | "hero";
  className?: string;
};

export default function Logo({ variant = "nav", className }: LogoProps) {
  const isHero = variant === "hero";

  return (
    <div
      className={
        (className || "") +
        " select-none text-black"
      }
      aria-label="Antoine Hair Institute"
      role="img"
    >
      <div className={isHero ? "mx-[-6px] inline-block" : "inline-block"}>
        <div
          className={
            "relative inline-flex items-center " +
            (isHero ? "gap-4" : "gap-2")
          }
        >
          {/* frame lines */}
          <span
            className={
              "block h-[1px] bg-black " + (isHero ? "w-24" : "w-8")
            }
          />
          <div className="relative">
            <span
              className={
                (isHero ? "text-[10vw] leading-none font-serif" : "text-xl font-serif") +
                " tracking-[0.04em]"
              }
              style={{ fontVariantLigatures: "discretionary-ligatures" }}
            >
              Antoine
            </span>
            {/* decorative swoosh removed per request */}
            <div className="mt-[-6px] text-center text-[0.65rem] tracking-[0.6em] text-zinc-700">
              H A I R&nbsp;&nbsp; I N S T I T U T E
            </div>
          </div>
          <span
            className={
              "block h-[1px] bg-black " + (isHero ? "w-24" : "w-8")
            }
          />
        </div>
      </div>
      {!isHero && (
        <div className="mt-1 text-[10px] text-zinc-600">
          SZKOLENIA & WSPARCIE BIZNESOWE DLA FRYZJERÓW
        </div>
      )}
    </div>
  );
}


