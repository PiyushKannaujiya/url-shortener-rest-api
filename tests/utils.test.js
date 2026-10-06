const test = require("node:test");
const assert = require("node:assert/strict");
const generateShortCode = require("../utils/generateShortCode");
const { validateExpiration, validateHttpUrl } = require("../utils/validation");

test("generates URL-safe eight-character short codes", () => {
    const code = generateShortCode();
    assert.match(code, /^[A-Za-z0-9_-]{8}$/);
});

test("accepts only http and https destination URLs", () => {
    assert.equal(validateHttpUrl(" https://example.com/path "), "https://example.com/path");

    for (const value of ["javascript:alert(1)", "data:text/html,test", "ftp://example.com"]) {
        assert.throws(() => validateHttpUrl(value), { statusCode: 400 });
    }
});

test("requires a future ISO-style expiration and supports explicit clearing", () => {
    assert.equal(validateExpiration(null, { allowNull: true }), null);
    assert.throws(() => validateExpiration("not-a-date"), { statusCode: 400 });
    assert.throws(() => validateExpiration("2000-01-01T00:00:00.000Z"), { statusCode: 400 });
    assert.ok(validateExpiration("2030-01-01T00:00:00.000Z") instanceof Date);
});
