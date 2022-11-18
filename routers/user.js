import express from "express";
import {
  externalSignIn,
  signIn,
  signUp,
  signUpDemo,
  resetPassword,
  changePassword,
  deleteUser,
  getUsers,
} from "../controllers/user.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/getusers", getUsers);
router.post("/signin", signIn);
router.post("/signup", signUp);
router.post("/signupdemo", signUpDemo);
router.post("/externalsignin", externalSignIn);
router.post("/resetpassword", resetPassword);
router.patch("/changepassword/:token", changePassword);
router.delete("/:id", auth, deleteUser);

export default router;
