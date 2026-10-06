const validateEnvironment = () => {
    const requiredVariables = ["MONGO_URI", "JWT_SECRET", "BASE_URL"];
    const missingVariables = requiredVariables.filter((name) => !process.env[name]?.trim());

    if (missingVariables.length) {
        throw new Error(`Missing required environment variables: ${missingVariables.join(", ")}`);
    }

    if (process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.includes("replace_with")) {
        throw new Error("JWT_SECRET must be a unique secret of at least 32 characters");
    }

    const port = Number(process.env.PORT || 5000);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error("PORT must be a valid port number");
    }

    let baseUrl;
    try {
        baseUrl = new URL(process.env.BASE_URL);
    } catch {
        throw new Error("BASE_URL must be a valid URL");
    }

    if (!["http:", "https:"].includes(baseUrl.protocol)) {
        throw new Error("BASE_URL must use http or https");
    }

    return { port };
};

module.exports = validateEnvironment;
