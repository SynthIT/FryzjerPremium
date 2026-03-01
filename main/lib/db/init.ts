import mongoose from "mongoose";
import "@/lib/models/Products";
import "@/lib/models/Courses";
import "@/lib/models/Delivery";
import "@/lib/models/Users";
import "@/lib/models/shared";

export async function db() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.NODE_ENV === "development" ? process.env.MONGO_URI_DEV! : process.env.MONGO_URI!, {
            maxIdleTimeMS: 10000,
            maxPoolSize: 50,
        });
    }
    if (mongoose.connection.readyState === 3) {
        await mongoose.connect(process.env.NODE_ENV === "development" ? process.env.MONGO_URI_DEV! : process.env.MONGO_URI!, {
            maxIdleTimeMS: 10000,
            maxPoolSize: 50,
        });
    }

    return mongoose;
}
