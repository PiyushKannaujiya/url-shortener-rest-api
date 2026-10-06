
const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
    {
        user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
},
        originalUrl: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2048
        },

        shortCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: /^[A-Za-z0-9_-]{8}$/
        },

        clicks: {
            type: Number,
            default: 0,
            min: 0
        },

        expiresAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    });
    urlSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

urlSchema.index({ user: 1, createdAt: -1 });

const Url = mongoose.model("Url", urlSchema);

module.exports = Url;
