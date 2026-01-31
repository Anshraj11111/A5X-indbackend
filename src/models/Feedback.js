import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
    {
        name: {type: String, required: true},
        message: {type: String, required: true},
        rating: {type: Number, required: true, min: 1, max: 5},
        isApproved: {type: Boolean, default: false},
    },
    {timestamps: true}
);


export default mongoose.model('Feedback', feedbackSchema);