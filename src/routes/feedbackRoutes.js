import express from "express";
import {
  submitFeedback,
  getAllFeedback,
  approveFeedback,
  getTopFeedback,
  getAllApprovedFeedback,
  deleteFeedback,
} from "../controllers/feedbackController.js";

const router = express.Router();

router.post("/", submitFeedback);
router.get("/admin", getAllFeedback);
router.put("/approve/:id", approveFeedback);
router.get("/top", getTopFeedback);
router.get("/approved", getAllApprovedFeedback);
router.delete("/:id", deleteFeedback);

export default router;