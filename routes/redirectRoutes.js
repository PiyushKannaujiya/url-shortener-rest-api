const express = require("express");

const router = express.Router();

const { redirectToOriginalUrl } = require("../controllers/urlController");
const asyncHandler = require("../utils/asyncHandler");

router.get("/:shortCode", asyncHandler(redirectToOriginalUrl));

module.exports = router;
