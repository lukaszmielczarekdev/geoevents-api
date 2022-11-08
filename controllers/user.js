import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { v4 as uuidv4 } from "uuid";
import { generateRandomStringNumber } from "../utils.js";

export const externalSignin = async (req, res) => {
  try {
    const { credential } = req.body;
    const decodedData = jwt.decode(credential);

    const existingUser = await User.findOne({ email: decodedData.email });
    if (!existingUser) {
      if (decodedData.name.toLowerCase() === "admin") {
        return res.status(400).json({ message: "Invalid username" });
      }

      const hashedPassword = await bcrypt.hash(uuidv4(), 12);

      const user = await User.create({
        name: decodedData.name,
        password: hashedPassword,
        email: decodedData.email,
        createdAt: null,
      });

      await user.save();

      res.status(200).json({
        user: {
          name: user.name,
          email: user.email,
          profile: user.profile,
          external: true,
          newsletter: user.newsletter,
        },
        token: credential,
      });
    } else {
      res.status(200).json({
        user: {
          name: existingUser.name,
          email: existingUser.email,
          profile: existingUser.profile,
          newsletter: existingUser.newsletter,
        },
        token: credential,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser)
      return res.status(404).json({ message: "User not found" });

    const isPasswordCorect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorect)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: existingUser._id, email: existingUser.email },
      process.env.SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      user: {
        name: existingUser.name,
        email: existingUser.email,
        profile: existingUser.profile,
        newsletter: existingUser.newsletter,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const signup = async (req, res) => {
  const { username, email, password, confirmpassword } = req.body;

  try {
    if (username.toLowerCase() === "admin") {
      return res.status(400).json({ message: "Invalid username" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    if (password !== confirmpassword)
      return res.status(400).json({ message: "Passwords don't match" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: username,
      password: hashedPassword,
      email,
      createdAt: null,
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.SECRET,
      {
        expiresIn: "24h",
      }
    );

    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        profile: user.profile,
        newsletter: user.newsletter,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const signupdemo = async (req, res) => {
  try {
    const username = "guest" + generateRandomStringNumber();
    const user = await User.create({
      name: username,
      password: uuidv4(),
      email: username + "@gmail.com",
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.SECRET,
      {
        expiresIn: "24h",
      }
    );

    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        profile: user.profile,
        newsletter: user.newsletter,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
