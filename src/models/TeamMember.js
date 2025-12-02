import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    designation: { type: String, required: true },
    bio: { type: String, required: true },

    photo: { type: String, required: true }, // image URL

    linkedin: { type: String, default: null },
    instagram: { type: String, default: null },

    showOnHome: { type: Boolean, default: false },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("TeamMember", teamSchema);
