import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import { v4 as uuidv4 } from "uuid";
import { generateRandomStringNumber } from "../utils.js";
import {
  transporter,
  passwordResetRequestMailTemplate,
  passwordChangeConfirmationMailTemplate,
} from "../mailService.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select({ _id: 1, name: 1, friends: 1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const externalSignIn = async (req, res) => {
  try {
    const { credential } = req.body;
    const decodedData = jwt.decode(credential);

    const existingUser = await User.findOne({ email: decodedData.email });
    if (!existingUser) {
      if (decodedData.name.toLowerCase() === "admin") {
        return res.status(400).json({ message: "Invalid username." });
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
          _id: user._id,
          name: user.name,
          email: user.email,
          friends: user.friends,
          external: true,
          newsletter: user.newsletter,
        },
        token: credential,
      });
    } else {
      res.status(200).json({
        user: {
          _id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          friends: existingUser.friends,
          newsletter: existingUser.newsletter,
        },
        token: credential,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser)
      return res.status(404).json({ message: "User not found." });

    const isPasswordCorect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorect)
      return res.status(400).json({ message: "Invalid password." });

    const token = jwt.sign(
      {
        id: existingUser._id,
        email: existingUser.email,
        name: existingUser.name,
      },
      process.env.SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      user: {
        _id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        friends: existingUser.friends,
        newsletter: existingUser.newsletter,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const signUp = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (username.toLowerCase() === "admin") {
      return res.status(400).json({ message: "Invalid username." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists." });

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: username,
      password: hashedPassword,
      email,
      createdAt: null,
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.SECRET,
      {
        expiresIn: "24h",
      }
    );

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        friends: user.friends,
        newsletter: user.newsletter,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const signUpDemo = async (req, res) => {
  try {
    const username = "guest" + generateRandomStringNumber();
    const user = await User.create({
      name: username,
      password: uuidv4(),
      email: username + "@geoeventsmail.com",
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.SECRET,
      {
        expiresIn: "24h",
      }
    );

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        friends: user.friends,
        newsletter: user.newsletter,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const resetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser || existingUser.external)
      return res.status(404).json({ message: "User not found." });

    const USER_SECRET = process.env.SECRET;

    const token = jwt.sign(
      { id: existingUser._id, email: existingUser.email },
      USER_SECRET,
      {
        expiresIn: "15m",
      }
    );

    const link = `https://geoevents.pages.dev/resetpassword/#access_token=${token}`;

    await transporter.sendMail({
      from: "geoevents.team@gmail.com",
      to: email,
      subject: "GeoEvents - Password Reset Request.",
      html: passwordResetRequestMailTemplate(
        link,
        existingUser.name,
        existingUser.email
      ),
    });

    res.json({ message: "Password reset link sent." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  const { password, confirmpassword } = req.body;
  const { token } = req.params;

  if (password !== confirmpassword)
    return res.status(400).json({ message: "Passwords don't match." });

  const decodedToken = jwt.verify(token, process.env.SECRET);

  if (!decodedToken) {
    return res.status(400).send("Access denied");
  }

  if (decodedToken.exp * 1000 < new Date().getTime()) {
    return res
      .status(400)
      .json({ message: "Password reset link has expired." });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const existingUser = await User.findOne({ _id: decodedToken.id });
    if (!existingUser || existingUser.external)
      return res.status(404).json({ message: "User not found." });

    await User.findOneAndUpdate(
      { _id: decodedToken.id },
      { password: hashedPassword },
      {
        new: true,
      }
    ).exec();

    const link = `https://geoevents.pages.dev/`;

    await transporter.sendMail({
      from: "geoevents.team@gmail.com",
      to: existingUser.email,
      subject: "GeoEvents - Password Successfully Changed.",
      html: passwordChangeConfirmationMailTemplate(
        link,
        existingUser.name,
        existingUser.email
      ),
    });

    res.json({ message: "Password successfully changed." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  if (req.userId.includes("@")) {
    try {
      await User.findOneAndDelete({ email: req.userId }).exec();

      res.json({ user: null });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.userId))
        return res.status(404).json({ message: "User not found." });

      await User.findOneAndDelete({ _id: req.userId }).exec();

      res.json({ user: null });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};
