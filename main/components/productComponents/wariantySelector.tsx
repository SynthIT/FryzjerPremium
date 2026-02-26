import { Warianty } from "@/lib/types/productTypes";

interface WariantySelectorProps {
    warianty: Warianty;
    selectedWariant: Warianty;
    handleWariantSelect: (w: Warianty) => void;
}

export default function WariantySelector({
    warianty,
    selectedWariant,
    handleWariantSelect,
}: WariantySelectorProps) {
    return (
        <button
            className={`size-option ${
                selectedWariant?.nazwa === warianty.nazwa ? "selected" : ""
            }`}
            onClick={() => handleWariantSelect(warianty)}
            title={warianty.nazwa}
            aria-label={warianty.nazwa}>
            {warianty.nazwa}
        </button>
    );
}

