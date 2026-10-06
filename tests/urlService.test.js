const test = require("node:test");
const assert = require("node:assert/strict");
const Url = require("../models/Url");
const { createShortUrlService } = require("../services/urlService");

test("retries duplicate short codes and succeeds with a new code", async () => {
    const originalCreate = Url.create;
    const attempts = [];
    const codes = ["duplicate", "unique___"];

    Url.create = async (document) => {
        attempts.push(document.shortCode);
        if (document.shortCode === "duplicate") {
            const error = new Error("duplicate");
            error.code = 11000;
            throw error;
        }
        return document;
    };

    try {
        const result = await createShortUrlService(
            "https://example.com",
            null,
            "507f1f77bcf86cd799439011",
            () => codes.shift()
        );
        assert.equal(result.shortCode, "unique___");
        assert.deepEqual(attempts, ["duplicate", "unique___"]);
    } finally {
        Url.create = originalCreate;
    }
});

test("returns a controlled error after duplicate retries are exhausted", async () => {
    const originalCreate = Url.create;
    Url.create = async () => {
        const error = new Error("duplicate");
        error.code = 11000;
        throw error;
    };

    try {
        await assert.rejects(
            createShortUrlService("https://example.com", null, "507f1f77bcf86cd799439011", () => "duplicate"),
            { statusCode: 503 }
        );
    } finally {
        Url.create = originalCreate;
    }
});
