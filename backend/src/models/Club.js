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
        ref: 'Organiser',
        required: true,
    },
    members: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Student'
    }]
}, { timestamps: true });

export const Club = mongoose.model('Club', clubSchema);
