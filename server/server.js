import app from "./app.js";
import connectDB from "./src/config/db.js";
import dns from "dns";
import "dotenv/config";

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
])
const port = process.env.PORT || 4000

const startServer = async () => {
    try {
        // first connect Data_Base
        await connectDB();

        // start server
        app.listen(port , () => {
            console.log(`Your Server Running on http://localhost:${port}`);
        })
    } catch (error) {
        console.error(`Error To Run Server : ${error.message}`);
        process.exit(1)
    }
}

startServer();