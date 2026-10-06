const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    const match = typeof authHeader === "string" && authHeader.match(/^Bearer ([^\s]+)$/);

    if (!match) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    const token = match[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { algorithms: ["HS256"] }
        );

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = authMiddleware;
