const express = require("express");

const router = express.Router();

const { createShortUrl,getUrlStatistics , getMyUrlsController,
    updateUrlController,
    deleteUrlController
 } = require("../controllers/urlController");

const authMiddleware = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

router.post("/", authMiddleware, asyncHandler(createShortUrl));

router.get("/my", authMiddleware, asyncHandler(getMyUrlsController));

router.get("/:shortCode/stats", authMiddleware, asyncHandler(getUrlStatistics));

router.put("/:shortCode", authMiddleware, asyncHandler(updateUrlController));

router.delete("/:shortCode", authMiddleware, asyncHandler(deleteUrlController));

module.exports = router;
