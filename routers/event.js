import express from "express";
import { getEvents, addEvent } from "../controllers/event.js";
// import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", getEvents);
router.post("/", addEvent);
// router.post("/", auth, addEvent);

export default router;
