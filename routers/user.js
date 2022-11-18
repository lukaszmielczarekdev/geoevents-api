import express from "express";
import {
  externalsignin,
  signin,
  signup,
  signupdemo,
  resetpassword,
  changepassword,
  deleteuser,
} from "../controllers/user.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/signin", signin);
router.post("/signup", signup);
router.post("/signupdemo", signupdemo);
router.post("/externalsignin", externalsignin);
router.post("/resetpassword", resetpassword);
router.patch("/changepassword/:token", changepassword);
router.delete("/:id", auth, deleteuser);

export default router;
