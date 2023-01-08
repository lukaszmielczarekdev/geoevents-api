import express from "express";
import {
  addMessage,
  addConversation,
  getMessages,
  getConversations,
  getMembersConversation,
} from "../controllers/chat.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/message/", auth, addMessage);
router.get("/messages/:id", auth, getMessages);
router.post("/conversation/", auth, addConversation);
router.get("/conversations/:id", auth, getConversations);
router.get(
  "/conversation/members/:firstUserId/:secondUserId",
  auth,
  getMembersConversation
);

export default router;
