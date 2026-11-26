import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`Mongodb Connect Successfully`);
    } catch (error) {
        console.error(`Error to connect DB: ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;