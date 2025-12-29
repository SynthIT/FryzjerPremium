import { Users } from "@/lib/models/Users";
import { User } from "lucide-react";

interface LoggedBadgeProps {
    user: Users;
    setModalMenu: () => void;
}
export default function LoggedBadge({ user, setModalMenu }: LoggedBadgeProps) {
    // chuj ci w dupe krecik, tutaj już zaczyna się twoja robota
    // ja w to nie umiem, i chuj ci w kokodżambo
    return (
        <>
            <button onClick={setModalMenu}>
                <div className="container-md flex align-center hover:transform-[scale(1.05) rotate(-5deg)] cursor-pointer">
                    <User className="text-zinc-900"></User>
                    <span className="text-zinc-900">Witaj, {user.imie}</span>
                </div>
            </button>
        </>
    );
}

