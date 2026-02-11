import mongoose from "mongoose";

export async function db() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect("mongodb://localhost:27017/fryzjerpremium", {
            maxIdleTimeMS: 10000,
            maxPoolSize: 50,
        });
    }
    if (mongoose.connection.readyState === 3) {
        await mongoose.connect("mongodb://localhost:27017/fryzjerpremium", {
            maxIdleTimeMS: 10000,
            maxPoolSize: 50,
        });
    }

    return mongoose;
}
