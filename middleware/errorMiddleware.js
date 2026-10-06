const errorMiddleware = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof SyntaxError && "body" in err) {
        return res.status(400).json({ success: false, message: "Malformed JSON request body" });
    }

    if (err?.name === "ValidationError") {
        return res.status(400).json({ success: false, message: "Validation failed" });
    }

    if (err?.code === 11000) {
        return res.status(409).json({ success: false, message: "A record with that value already exists" });
    }

    if (err?.statusCode && err.statusCode >= 400 && err.statusCode < 600) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
    }

    console.error("Unhandled request error", err);

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
};

module.exports = errorMiddleware;
