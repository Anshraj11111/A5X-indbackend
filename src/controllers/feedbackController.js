import Feedback from "../models/Feedback.js";

export const submitFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.create(req.body);
    res.status(201).json({
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllFeedback = async (req, res) => {
  const feedbacks = await Feedback.find().sort({ createdAt: -1 });
  res.json(feedbacks);
};

export const approveFeedback = async (req, res) => {
  await Feedback.findByIdAndUpdate(req.params.id, {
    isApproved: true,
  });
  res.json({ message: "Feedback approved successfully" });
};

export const getTopFeedback = async (req, res) => {
  const feedbacks = await Feedback.find({
    isApproved: true,
    rating: { $gte: 4 },
  })
    .sort({ rating: -1 })
    .limit(10);

  res.json(feedbacks);
};

export const getAllApprovedFeedback = async (req, res) => {
  const feedbacks = await Feedback.find({ isApproved: true }).sort({
    createdAt: -1,
  });
  res.json(feedbacks);
};

export const deleteFeedback = async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};