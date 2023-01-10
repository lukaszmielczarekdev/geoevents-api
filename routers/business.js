import express from "express";
import {
  getBusinesses,
  addBusiness,
  likeBusiness,
  rateBusiness,
  deleteBusiness,
} from "../controllers/business.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", getBusinesses);
router.post("/", auth, addBusiness);
router.patch("/like/:id", auth, likeBusiness);
router.patch("/rate/:id", auth, rateBusiness);
router.delete("/:id", auth, deleteBusiness);

export default router;
