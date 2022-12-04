import express from "express";
import {
  getPosts,
  addPost,
  likePost,
  deletePost,
} from "../controllers/post.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getPosts);
router.post("/", auth, addPost);
router.patch("/like/:id", auth, likePost);
router.delete("/:id", auth, deletePost);

export default router;
