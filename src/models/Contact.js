import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
    {
        user_name: { type: String, required: true },
        user_email: { type: String, required: true },
        user_phone: { type: String, required: true },
        organization: { type: String, default: null },
        project_type: { type: String, default: null },
        budget: { type: String, default: null },
        message: { type: String, required: true },
        status: { type: String, enum: ['new', 'viewed', 'replied'], default: 'new' },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model('Contact', contactSchema);
