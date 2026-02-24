import mongoose from "mongoose";

export async function db() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI!, {
            maxIdleTimeMS: 10000,
            maxPoolSize: 50,
        });
    }
    if (mongoose.connection.readyState === 3) {
        await mongoose.connect(process.env.MONGO_URI!, {
            maxIdleTimeMS: 10000,
            maxPoolSize: 50,
        });
    }

    return mongoose;
}
