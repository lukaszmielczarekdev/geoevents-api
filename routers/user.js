import express from "express";
import {
  externalSignin,
  signin,
  signup,
  signupdemo,
} from "../controllers/user.js";

const router = express.Router();

router.post("/signin", signin);
router.post("/signup", signup);
router.post("/signupdemo", signupdemo);
router.post("/externalsignin", externalSignin);

export default router;
