import mongoose, { mongo } from "mongoose";

let connected = false;

export default async function db() {
    if (connected) return mongoose;
    await mongoose.connect("mongodb://localhost:27017/fryzjerpremium");
    connected = true;
    return mongoose;
}
