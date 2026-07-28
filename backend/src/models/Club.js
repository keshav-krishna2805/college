import mongoose from 'mongoose';

const clubSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a club name'],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

export const Club = mongoose.model('Club', clubSchema);
