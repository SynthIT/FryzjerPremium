import { Users } from "@/lib/types/userTypes";
import { User } from "lucide-react";

interface LoggedBadgeProps {
    user: Users;
    setModalMenu: () => void;
}
export default function LoggedBadge({ user, setModalMenu }: LoggedBadgeProps) {
    return (
        <button
            type="button"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-white/50 hover:text-[#D2B79B] transition-colors"
            onClick={setModalMenu}
            aria-label="Menu użytkownika"
            aria-expanded={false}>
            <User className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium hidden sm:inline">Witaj, {user.imie}</span>
        </button>
    );
}

