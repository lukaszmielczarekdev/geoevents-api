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

export const getUser = async (req, res) => {
  const { id: _id } = req.params;

  try {
    let user;

    if (typeof _id === "string") {
      user = await User.findOne({ name: _id }).select({
        _id: 1,
        name: 1,
        following: 1,
        followers: 1,
        description: 1,
        avatar: 1,
      });
    } else {
      user = await User.findOne({ _id }).select({
        _id: 1,
        name: 1,
        following: 1,
        followers: 1,
        description: 1,
        avatar: 1,
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select({
      _id: 1,
      name: 1,
      following: 1,
      followers: 1,
      description: 1,
      avatar: 1,
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const externalSignIn = async (req, res) => {
  try {
    const { credential } = req.body;
    const decodedData = jwt.decode(credential);

    const existingUser = await User.findOne({
      $or: [{ email: decodedData.email }, { name: decodedData.name }],
    });

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
          following: user.following,
          followers: user.followers,
          description: user.description,
          avatar: user.avatar,
          external: true,
        },
        token: credential,
      });
    } else {
      res.status(200).json({
        user: {
          _id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          following: existingUser.following,
          followers: existingUser.followers,
          newsletter: existingUser.newsletter,
          description: existingUser.description,
          avatar: existingUser.avatar,
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
        following: existingUser.following,
        followers: existingUser.followers,
        description: existingUser.description,
        avatar: existingUser.avatar,
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

    const existingUser = await User.findOne({
      $or: [{ email }, { name: username }],
    });

    if (existingUser)
      return res
        .status(400)
        .json({ message: "Username or email is already taken." });

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
        following: user.following,
        followers: user.followers,
        newsletter: user.newsletter,
        description: user.description,
        avatar: user.avatar,
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
        following: user.following,
        followers: user.followers,
        newsletter: user.newsletter,
        description: user.description,
        avatar: user.avatar,
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
      return res
        .status(404)
        .json({ message: "Password cannot be changed or user not found." });

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

export const updatePassword = async (req, res) => {
  const { oldpassword, newpassword } = req.body;

  if (req.userId.includes("@")) {
    try {
      res.json(null);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    try {
      const existingUser = await User.findOne({ _id: req.userId });

      if (!existingUser)
        return res.status(404).json({ message: "User not found." });

      const isPasswordCorect = await bcrypt.compare(
        oldpassword,
        existingUser.password
      );

      if (!isPasswordCorect)
        return res.status(400).json({ message: "Invalid password." });

      const hashedPassword = await bcrypt.hash(newpassword, 12);

      const updatedUser = await User.findOneAndUpdate(
        { _id: req.userId },
        { password: hashedPassword },
        {
          new: true,
        }
      ).exec();

      const token = jwt.sign(
        { id: updatedUser._id, email: updatedUser.email },
        process.env.SECRET,
        {
          expiresIn: "24h",
        }
      );

      res.json({
        token,
        message: "Password successfully updated.",
      });
    } catch (error) {
      res.status(500).json({ message: "Something went wrong." });
    }
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

export const follow = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send("User not found.");

    let activeUser;
    if (req.userId.includes("@")) {
      activeUser = await User.findOne({ email: req.userId });
    } else {
      activeUser = await User.findOne({ _id: req.userId });
    }

    let userToFollow;
    if (id.includes("@")) {
      userToFollow = await User.findOne({ email: id });
    } else {
      userToFollow = await User.findOne({ _id: id });
    }

    if (id === activeUser._id.toString()) {
      return res.status(400).send("User cannot be followed.");
    }

    const ifFollowing = userToFollow.followers.find(
      (user) => user._id === activeUser._id.toString()
    );

    if (!ifFollowing) {
      // userToFallow
      const userFollowers = [
        ...userToFollow.followers,
        { _id: req.userId, name: req.username },
      ];

      // activeUser
      const userFollowing = [
        ...activeUser.following,
        { _id: userToFollow._id.toString(), name: userToFollow.name },
      ];

      let updatedUserToFollow;
      if (id.includes("@")) {
        updatedUserToFollow = await User.findOneAndUpdate(
          { email: id },
          { followers: userFollowers },
          { new: true }
        );
      } else {
        updatedUserToFollow = await User.findOneAndUpdate(
          { _id: id },
          { followers: userFollowers },
          { new: true }
        );
      }

      let updatedActiveUser;
      if (req.userId.includes("@")) {
        updatedActiveUser = await User.findOneAndUpdate(
          { email: req.userId },
          { following: userFollowing },
          { new: true }
        );
      } else {
        updatedActiveUser = await User.findOneAndUpdate(
          { _id: req.userId },
          { following: userFollowing },
          { new: true }
        );
      }

      const { _id, name, email, following, followers, avatar, description } =
        updatedActiveUser;

      res.json({
        activeUser: {
          _id: _id.toString(),
          name,
          email,
          following,
          followers,
          description,
          avatar,
        },
        userToFollow: {
          _id: updatedUserToFollow._id.toString(),
          name: updatedUserToFollow.name,
          following: updatedUserToFollow.following,
          followers: updatedUserToFollow.followers,
          description: updatedUserToFollow.description,
          avatar: updatedUserToFollow.avatar,
        },
      });
    } else {
      // userToFollow
      const userFollowers = userToFollow.followers.filter(
        (user) => user._id.toString() !== req.userId
      );

      // activeUser
      const userFollowing = activeUser.following.filter(
        (user) => user._id.toString() !== userToFollow._id.toString()
      );

      let updatedUserToFollow;
      if (id.includes("@")) {
        updatedUserToFollow = await User.findOneAndUpdate(
          { email: id },
          { followers: userFollowers },
          { new: true }
        );
      } else {
        updatedUserToFollow = await User.findOneAndUpdate(
          { _id: id },
          { followers: userFollowers },
          { new: true }
        );
      }

      let updatedActiveUser;
      if (req.userId.includes("@")) {
        updatedActiveUser = await User.findOneAndUpdate(
          { email: req.userId },
          { following: userFollowing },
          { new: true }
        );
      } else {
        updatedActiveUser = await User.findOneAndUpdate(
          { _id: req.userId },
          { following: userFollowing },
          { new: true }
        );
      }

      const { _id, name, email, following, followers, description, avatar } =
        updatedActiveUser;

      res.json({
        activeUser: {
          _id: _id.toString(),
          name,
          email,
          following,
          followers,
          description,
          avatar,
        },
        userToFollow: {
          _id: updatedUserToFollow._id.toString(),
          name: updatedUserToFollow.name,
          following: updatedUserToFollow.following,
          followers: updatedUserToFollow.followers,
          description: updatedUserToFollow.description,
          avatar: updatedUserToFollow.avatar,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const updateUser = async (req, res) => {
  const { dataType, data } = req.body;

  if (req.userId.includes("@")) {
    try {
      const updatedUser = await User.findOneAndUpdate(
        { email: req.userId },
        { [dataType]: data },
        {
          new: true,
        }
      )
        .select({
          _id: 1,
          name: 1,
          following: 1,
          followers: 1,
          description: 1,
          avatar: 1,
        })
        .exec();

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    if (!mongoose.Types.ObjectId.isValid(req.userId))
      return res.status(404).json({ message: "User not found" });

    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.userId },
        { [dataType]: data },
        {
          new: true,
        }
      )
        .select({
          _id: 1,
          name: 1,
          following: 1,
          followers: 1,
          description: 1,
          avatar: 1,
        })
        .exec();

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};
