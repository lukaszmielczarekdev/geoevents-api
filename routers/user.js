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
  getUser,
  follow,
} from "../controllers/user.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/getuser/:id", auth, getUser);
router.get("/getusers", auth, getUsers);
router.post("/signin", signIn);
router.post("/signup", signUp);
router.post("/signupdemo", signUpDemo);
router.post("/externalsignin", externalSignIn);
router.post("/resetpassword", resetPassword);
router.patch("/changepassword/:token", changePassword);
router.patch("/follow/:id", auth, follow);
router.delete("/:id", auth, deleteUser);

export default router;
