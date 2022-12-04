import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

export const getPosts = async (req, res) => {
  try {
    let followingUsers;

    if (req.userId.includes("@")) {
      followingUsers = await User.find({ email: req.userId }, { following: 1 });
    } else {
      followingUsers = await User.find({ _id: req.userId }, { following: 1 });
    }

    const ids = followingUsers[0].following.map((obj) => obj._id);
    ids.push(req.userId);

    const targetedPosts = await Post.find({ "creator._id": { $in: ids } })
      .sort({ createdAt: -1 })
      .limit(25);

    res.status(200).json(targetedPosts);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const addPost = async (req, res) => {
  const postData = req.body;

  const newPost = new Post({
    ...postData,
    creator: { _id: req.userId, name: req.username },
  });

  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const likePost = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("Post not found.");

  const existingPost = await Post.findOne({ _id });

  const ifLiked = existingPost.likes.find((user) => user._id === req.userId);

  if (ifLiked) {
    const likes = existingPost.likes.filter((user) => user._id !== req.userId);
    const updatedPost = await Post.findOneAndUpdate(
      { _id },
      { likes },
      { new: true }
    );
    res.json(updatedPost);
  } else {
    const updatedPost = await Post.findOneAndUpdate(
      { _id },
      {
        likes: [...existingPost.likes, { _id: req.userId, name: req.username }],
      },
      { new: true }
    );
    res.json(updatedPost);
  }
};
