const express = require("express");
const urlRoutes = require("./routes/urlRoutes");
const redirectRoutes = require("./routes/redirectRoutes");
const authRoutes = require("./routes/authRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use("/api/url", urlRoutes);
app.use("/api/auth", authRoutes);
app.use("/", redirectRoutes);
app.use(errorMiddleware);

module.exports = app;
