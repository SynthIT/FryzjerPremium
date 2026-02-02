import { Users } from "@/lib/types/userTypes";
import { User } from "lucide-react";

interface LoggedBadgeProps {
    user: Users;
    setModalMenu: () => void;
}
export default function LoggedBadge({ user, setModalMenu }: LoggedBadgeProps) {
    return (
        <button 
            className="user-button" 
            onClick={setModalMenu}
            aria-label="Menu użytkownika"
            aria-expanded={false}>
            <User className="user-button-icon" />
            <span className="user-button-text">Witaj, {user.imie}</span>
        </button>
    );
}

