require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const validateEnvironment = require("./config/env");

const startServer = async () => {
    try {
        const { port } = validateEnvironment();
        await connectDB();
        app.listen(port, () => console.log(`Server running on port ${port}`));
    } catch (error) {
        console.error("Application startup failed:", error.message);
        process.exit(1);
    }
};

if (require.main === module) {
    startServer();
}

module.exports = { app, startServer };
