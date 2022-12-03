import express from "express";
import { getPosts, addPost } from "../controllers/post.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getPosts);
router.post("/", auth, addPost);

export default router;
