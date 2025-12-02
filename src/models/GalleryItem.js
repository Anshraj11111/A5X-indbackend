import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema({
  url: { type: String, required: true },      // Image / video
  fileType: { type: String, default: "image" }, // image / video / pdf
  title: { type: String },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("GalleryItem", gallerySchema);
