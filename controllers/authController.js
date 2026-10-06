const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { validateLogin, validateRegistration } = require("../utils/validation");

const registerUser = async (req, res) => {
    const { name, email, password } = validateRegistration(req.body);
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new AppError(409, "User already exists");
    }

    const user = await User.create({
        name,
        email,
        password: await bcrypt.hash(password, 12)
    });

    return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: { id: user._id, name: user.name, email: user.email }
    });
};

const loginUser = async (req, res) => {
    const { email, password } = validateLogin(req.body);
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new AppError(401, "Invalid email or password");
    }

    const token = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: "1d", algorithm: "HS256" }
    );

    return res.status(200).json({ success: true, message: "Login successful", token });
};

module.exports = { registerUser, loginUser };
