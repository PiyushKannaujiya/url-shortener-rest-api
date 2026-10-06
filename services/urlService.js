const Url = require("../models/Url");
const generateShortCode = require("../utils/generateShortCode");
const AppError = require("../utils/AppError");

const createShortUrlService = async (
    originalUrl,
    expiresAt,
    userId,
    codeGenerator = generateShortCode
) => {
    const maxAttempts = 5;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
            return await Url.create({
                user: userId,
                originalUrl,
                shortCode: codeGenerator(),
                expiresAt: expiresAt || null
            });
        } catch (error) {
            if (error?.code !== 11000 || attempt === maxAttempts - 1) {
                if (error?.code === 11000) {
                    throw new AppError(503, "Could not generate a unique short URL. Please retry.");
                }
                throw error;
            }
        }
    }
};

const getMyUrls = async (userId, page = 1, limit = 5) => {
    const skip = (page - 1) * limit;

    const [urls, total] = await Promise.all([
        Url.find({ user: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        Url.countDocuments({ user: userId })
    ]);

    return {
        urls,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

const getUrlStats = async (shortCode, userId) => {
    const url = await Url.findOne({ shortCode, user: userId }).lean();

    return url;
};

const incrementClicksAndGetUrl = async (shortCode) => {
    const now = new Date();
    const updatedUrl = await Url.findOneAndUpdate(
        {
            shortCode,
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: now } }
            ]
        },
        { $inc: { clicks: 1 } },
        { new: true }
    ).lean();

    if (updatedUrl) {
        return { status: "success", url: updatedUrl };
    }

    const existingUrl = await Url.findOne({ shortCode }).select("expiresAt").lean();

    return {
        status: existingUrl?.expiresAt && existingUrl.expiresAt <= now
            ? "expired"
            : "not_found"
    };
};

const updateMyUrl = async (shortCode, userId, updateData) => {
    const url = await Url.findOneAndUpdate(
        {
            shortCode,
            user: userId
        },
        updateData,
        {
            new: true,
            runValidators: true
        }
    );

    return url;
};

const deleteMyUrl = async (shortCode, userId) => {
    const url = await Url.findOneAndDelete({
        shortCode,
        user: userId
    });

    return url;
};

module.exports = {
    createShortUrlService,
    incrementClicksAndGetUrl,
    getUrlStats,
    getMyUrls,
    updateMyUrl,
    deleteMyUrl
};
