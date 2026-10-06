const AppError = require("./AppError");

const MAX_URL_LENGTH = 2048;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 72;

const requireTrimmedString = (value, fieldName, maxLength) => {
    if (typeof value !== "string") {
        throw new AppError(400, `${fieldName} must be a string`);
    }

    const trimmed = value.trim();

    if (!trimmed) {
        throw new AppError(400, `${fieldName} is required`);
    }

    if (trimmed.length > maxLength) {
        throw new AppError(400, `${fieldName} must be at most ${maxLength} characters`);
    }

    return trimmed;
};

const validateHttpUrl = (value) => {
    const originalUrl = requireTrimmedString(value, "Original URL", MAX_URL_LENGTH);

    let parsedUrl;
    try {
        parsedUrl = new URL(originalUrl);
    } catch {
        throw new AppError(400, "Invalid URL");
    }

    if (
        !["http:", "https:"].includes(parsedUrl.protocol) ||
        !parsedUrl.hostname ||
        parsedUrl.username ||
        parsedUrl.password
    ) {
        throw new AppError(400, "URL must use http or https");
    }

    return parsedUrl.toString();
};

const validateExpiration = (value, { allowNull = false } = {}) => {
    if (value === null && allowNull) {
        return null;
    }

    if (typeof value !== "string" || !value.trim()) {
        throw new AppError(400, "Invalid expiration date");
    }

    const expiresAt = new Date(value);

    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
        throw new AppError(400, "Expiration date must be in the future");
    }

    return expiresAt;
};

const validateRegistration = ({ name, email, password } = {}) => {
    const normalizedName = requireTrimmedString(name, "Name", MAX_NAME_LENGTH);
    const normalizedEmail = requireTrimmedString(email, "Email", MAX_EMAIL_LENGTH).toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        throw new AppError(400, "Invalid email address");
    }

    if (typeof password !== "string" || password.length < 8 || password.length > MAX_PASSWORD_LENGTH) {
        throw new AppError(400, "Password must be between 8 and 72 characters");
    }

    return { name: normalizedName, email: normalizedEmail, password };
};

const validateLogin = ({ email, password } = {}) => {
    const normalizedEmail = requireTrimmedString(email, "Email", MAX_EMAIL_LENGTH).toLowerCase();

    if (typeof password !== "string" || !password) {
        throw new AppError(400, "Email and password are required");
    }

    return { email: normalizedEmail, password };
};

module.exports = {
    validateHttpUrl,
    validateExpiration,
    validateRegistration,
    validateLogin
};
