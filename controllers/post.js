import Post from "../models/postModel.js";
import User from "../models/userModel.js";

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
  const { postData } = req.body;

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
