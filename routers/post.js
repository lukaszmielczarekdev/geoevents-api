import express from "express";
import { getPosts, addPost, likePost } from "../controllers/post.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getPosts);
router.post("/", auth, addPost);
router.patch("/like/:id", auth, likePost);

export default router;
