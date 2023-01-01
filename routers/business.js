import express from "express";
import {
  getBusinesses,
  addBusiness,
  likeBusiness,
  deleteBusiness,
} from "../controllers/business.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", getBusinesses);
router.post("/", auth, addBusiness);
router.patch("/like/:id", auth, likeBusiness);
router.delete("/:id", auth, deleteBusiness);

export default router;
