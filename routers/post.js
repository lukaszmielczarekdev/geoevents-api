import express from "express";
import {
  getFollowingPosts,
  getUsersPosts,
  addPost,
  likePost,
  deletePost,
} from "../controllers/post.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/following", auth, getFollowingPosts);
router.get("/user/:id", auth, getUsersPosts);
router.post("/", auth, addPost);
router.patch("/like/:id", auth, likePost);
router.delete("/:id", auth, deletePost);

export default router;
