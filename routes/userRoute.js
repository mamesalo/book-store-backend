import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../model/userModel.js";
import { Token } from "../model/token.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import dotenv from "dotenv";

const router = express.Router();
dotenv.config();
// Route for User signup
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the username or email is already registered
    let existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    const token = await Token.create({
      userId: newUser._id,
      token: crypto.randomBytes(32).toString("hex"),
    });

    console.log("Basic url from env");
    console.log(process.env.BASE_URL);

    const url = `${process.env.BASE_URL}/user/${newUser._id}/verify/${token.token}`;
    console.log("url");
    console.log(URL);

    await sendEmail(newUser.email, "Verify your email address", url);

    console.log("success sent email");

    return res.status(201).json({ newUser, message: "" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
});

// Route for User login.
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the password is correct
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    if (!user.verified) {
      let token = await Token.findOne({ userId: user._id });
      let url;
      if (!token) {
        const newToken = await Token.create({
          userId: user._id,
          token: crypto.randomBytes(32).toString("hex"),
        });
        console.log(process.env.BASE_URL);

        url = `${process.env.BASE_URL}/user/${user._id}/verify/${newToken.token}`;
      } else {
        url = `${process.env.BASE_URL}/user/${user._id}/verify/${token.token}`;
      }
      await sendEmail(user.email, "Verify your email address", url);
      return res
        .status(401)
        .send({ message: "Email not verified. Verification email sent" });
    }
    // Generate JWT token with user ID included
    const token = jwt.sign(
      { userId: user._id, isLogged: true },
      "your_secret_key", // Use this key for development
      { expiresIn: "1h" }
    );

    return res.status(200).json({ token, username: user.username });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
});

router.get("/:id/verify/:token", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("user id => " + user._id);

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    console.log("token => " + token);

    if (!token) {
      return res.status(404).json({ message: "invalid link" });
    }
    await User.updateOne({ _id: user._id, verified: true });
    await token.deleteOne();
    console.log("done");

    res.status(200).send({ message: "Email verified successfully" });
  } catch (error) {
    console.log(error);

    res.status(500).send({ message: error.message });
  }
});
export default router;
