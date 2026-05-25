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
            className={`p-2 border border-black rounded-md text-sm font-medium transition-colors 
                ${selectedWariant?.nazwa === warianty.nazwa ? 
                    "bg-white text-black border-yellow-200 ring-2 ring-yellow-200" 
                    : "text-gray-600 hover:bg-gray-200 hover:text-black"
                }`}
            onClick={() => handleWariantSelect(warianty)}
            title={warianty.nazwa}
            aria-label={warianty.nazwa}>
            {warianty.nazwa}
        </button>
    );
}

