import { unstable_cache } from "next/cache";
import { getServiceStructure } from "./client";
import type { ApaczkaApiEnvelope, ApaczkaServiceStructure } from "./types";

const REVALIDATE_SEC = 24 * 60 * 60; // wytyczna Apaczka: max 1× / 24h

const fetchCached = unstable_cache(
    async () => getServiceStructure(),
    ["apaczka-service-structure"],
    { revalidate: REVALIDATE_SEC },
);

/**
 * service_structure z cache Next (revalidate 24h).
 * Spełnia wytyczną Apaczka — nie odpytujemy częściej niż raz na dobę (per deployment/instance cache).
 */
export async function getServiceStructureCached(): Promise<
    ApaczkaApiEnvelope<ApaczkaServiceStructure>
> {
    return fetchCached();
}
