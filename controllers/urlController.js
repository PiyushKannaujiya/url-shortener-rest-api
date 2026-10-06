const {
    createShortUrlService,
    incrementClicksAndGetUrl,
    getUrlStats,
    getMyUrls,
    updateMyUrl,
    deleteMyUrl
} = require("../services/urlService");
const AppError = require("../utils/AppError");
const { validateExpiration, validateHttpUrl } = require("../utils/validation");

const getShortUrl = (shortCode) => {
    const baseUrl = process.env.BASE_URL.endsWith("/")
        ? process.env.BASE_URL
        : `${process.env.BASE_URL}/`;

    return new URL(shortCode, baseUrl).toString();
};

const validateShortCode = (shortCode) => {
    if (!/^[A-Za-z0-9_-]{8}$/.test(shortCode)) {
        throw new AppError(400, "Invalid short code");
    }
};

const createShortUrl = async (req, res) => {
    const body = req.body || {};
    const originalUrl = validateHttpUrl(body.originalUrl);
    const expiresAt = body.expiresAt === undefined
        ? null
        : validateExpiration(body.expiresAt);
    const url = await createShortUrlService(originalUrl, expiresAt, req.user.userId);

    return res.status(201).json({
        success: true,
        data: {
            originalUrl: url.originalUrl,
            shortCode: url.shortCode,
            shortUrl: getShortUrl(url.shortCode),
            expiresAt: url.expiresAt
        }
    });
};

const redirectToOriginalUrl = async (req, res) => {
    const { shortCode } = req.params;
    validateShortCode(shortCode);

    const result = await incrementClicksAndGetUrl(shortCode);

    if (result.status === "not_found") {
        throw new AppError(404, "Short URL not found");
    }
    if (result.status === "expired") {
        throw new AppError(410, "Short URL has expired");
    }

    res.set("Cache-Control", "no-store");
    return res.redirect(result.url.originalUrl);
};

const getMyUrlsController = async (req, res) => {
    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    const limit = req.query.limit === undefined ? 5 : Number(req.query.limit);

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw new AppError(400, "page must be an integer >= 1 and limit must be an integer between 1 and 100");
    }

    const result = await getMyUrls(req.user.userId, page, limit);
    return res.status(200).json({ success: true, data: result });
};

const getUrlStatistics = async (req, res) => {
    const { shortCode } = req.params;
    validateShortCode(shortCode);
    const url = await getUrlStats(shortCode, req.user.userId);

    if (!url) {
        throw new AppError(404, "Short URL not found");
    }

    return res.status(200).json({
        success: true,
        data: {
            originalUrl: url.originalUrl,
            shortCode: url.shortCode,
            clicks: url.clicks,
            createdAt: url.createdAt,
            expiresAt: url.expiresAt
        }
    });
};

const updateUrlController = async (req, res) => {
    const { shortCode } = req.params;
    validateShortCode(shortCode);

    const allowedFields = ["originalUrl", "expiresAt"];
    const body = req.body || {};
    const suppliedFields = Object.keys(body);
    if (!suppliedFields.length || suppliedFields.some((field) => !allowedFields.includes(field))) {
        throw new AppError(400, "Provide at least one allowed field: originalUrl or expiresAt");
    }

    const updateData = {};
    if (body.originalUrl !== undefined) {
        updateData.originalUrl = validateHttpUrl(body.originalUrl);
    }
    if (body.expiresAt !== undefined) {
        updateData.expiresAt = validateExpiration(body.expiresAt, { allowNull: true });
    }

    const url = await updateMyUrl(shortCode, req.user.userId, updateData);
    if (!url) {
        throw new AppError(404, "URL not found or you are not the owner");
    }

    return res.status(200).json({ success: true, message: "URL updated successfully", data: url });
};

const deleteUrlController = async (req, res) => {
    const { shortCode } = req.params;
    validateShortCode(shortCode);
    const url = await deleteMyUrl(shortCode, req.user.userId);

    if (!url) {
        throw new AppError(404, "URL not found or you are not the owner");
    }

    return res.status(200).json({ success: true, message: "URL deleted successfully" });
};

module.exports = {
    createShortUrl,
    redirectToOriginalUrl,
    getUrlStatistics,
    getMyUrlsController,
    updateUrlController,
    deleteUrlController
};
