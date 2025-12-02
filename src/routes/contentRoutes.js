import express from 'express';
import Content from '../models/Content.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public - get content
router.get("/:page", async (req, res) => {
  const page = await Content.findOne({ page: req.params.page });
  res.json(page?.data || {});
});

// Admin - update content
router.post("/:page", protect, async (req, res) => {
  const { data } = req.body;

  let page = await Content.findOne({ page: req.params.page });

  if (page) {
    page.data = data;
    await page.save();
  } else {
    page = await Content.create({ page: req.params.page, data });
  }

  res.json(page);
});

export default router;
