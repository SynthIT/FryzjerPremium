import mongoosePkg from "mongoose";

const { Schema, model, models, default: mongoose } = mongoosePkg;

const DiscountsTable = {
  "user:discount": 1 << 0,
  "user:premium": 1 << 1,
  "user:special": 1 << 2,
};

const PermissionTable = {
  "admin:orders": 1 << 0,
  "admin:analytics": 1 << 1,
  "admin:categories": 1 << 2,
  "admin:courses": 1 << 3,
  "admin:delivery": 1 << 4,
  "admin:companies": 1 << 5,
  "admin:products": 1 << 6,
  "admin:producent": 1 << 7,
  "admin:promo": 1 << 8,
  "admin:blog": 1 << 9,
  "admin:roles": 1 << 10,
  "admin:users": 1 << 11,
  "admin:settings": 1 << 12,
  "admin:logs": 1 << 13,
};

function permissionToAdminNumber(permission) {
  let a = 0;
  for (const key of permission) {
    a |= PermissionTable[key];
  }
  return a;
}

function permissionToUserNumber(permission) {
  let a = 0;
  for (const key of permission) {
    a |= DiscountsTable[key];
  }
  return a;
}

const roleSchema = new Schema(
  {
    nazwa: { type: String, required: true, unique: true },
    uzytkownik: { type: Number, default: 0 },
    admin: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

const Role = models.Roles || model("Roles", roleSchema);

async function main() {
  try {
    await mongoose.connect("mongodb://localhost:27017/fryzjerpremium");
    console.log("Połączono z bazą danych");

    const allAdminNumbers = permissionToAdminNumber([
      "admin:orders",
      "admin:analytics",
      "admin:categories",
      "admin:courses",
      "admin:delivery",
      "admin:companies",
      "admin:products",
      "admin:producent",
      "admin:promo",
      "admin:logs",
    ]);

    const allUserNumbers = permissionToUserNumber([
      "user:discount",
      "user:premium",
      "user:special",
    ]);

    const admin = {
      nazwa: "admin",
      uzytkownik: allUserNumbers,
      admin: allAdminNumbers,
    };

    const role = await Role.create(admin);
    console.log("Rola admin została utworzona");
    console.log(role);
  } catch (error) {
    console.error("Błąd podczas łączenia z bazą danych:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

main();

