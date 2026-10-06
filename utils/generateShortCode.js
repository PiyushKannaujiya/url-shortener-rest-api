
const crypto = require("crypto");

const generateShortCode = () => crypto.randomBytes(6).toString("base64url");


module.exports = generateShortCode;
