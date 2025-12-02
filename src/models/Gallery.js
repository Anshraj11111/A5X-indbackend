import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema({
  fileUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Gallery", gallerySchema);
