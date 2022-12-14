import express from "express";
import {
  getEvents,
  addEvent,
  joinEvent,
  rateEvent,
  leaveEvent,
  deleteEvent,
} from "../controllers/event.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", getEvents);
router.post("/", auth, addEvent);
router.patch("/join/:id", auth, joinEvent);
router.patch("/rate/:id", auth, rateEvent);
router.patch("/leave/:id", auth, leaveEvent);
router.delete("/:id", auth, deleteEvent);

export default router;
