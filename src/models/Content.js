import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  page: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

export default mongoose.model("Content", contentSchema);
