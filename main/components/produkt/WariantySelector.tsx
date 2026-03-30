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
            className={`p-2 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors ${
                selectedWariant?.nazwa === warianty.nazwa ? "bg-gray-400 text-white" : ""
            }`}
            onClick={() => handleWariantSelect(warianty)}
            title={warianty.nazwa}
            aria-label={warianty.nazwa}>
            {warianty.nazwa}
        </button>
    );
}

