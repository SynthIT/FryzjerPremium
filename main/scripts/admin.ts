import { permissionToAdminNumber, permissionToUserNumber } from "../lib/auth/permissions";
import { Role } from "../lib/models/Users";
import { Roles } from "../lib/types/userTypes";
import mongoose from "mongoose";

(async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/fryzjerpremium");
        console.log("Połączono z bazą danych");
        const allAdminNumbers = permissionToAdminNumber(["admin:orders", "admin:analytics", "admin:categories", "admin:courses", "admin:delivery", "admin:companies", "admin:products", "admin:producent", "admin:promo", "admin:logs"]);
        const allUserNumbers = permissionToUserNumber(["user:discount", "user:premium", "user:special"]);
        const admin: Roles = {
            nazwa: "admin",
            uzytkownik: allUserNumbers,
            admin: allAdminNumbers,
        };
        const role = await Role.create(admin);
        console.log("Rola admin została utworzona");
        console.log(role);
    } catch (error) {
        console.error("Błąd podczas łączenia z bazą danych:", error);
        process.exit(1);
    }
})();