import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        select: false,
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please provide a phone number'],
    },
    rollNumber: {
        type: String,
        required: [true, 'Please provide a roll number'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    branch: {
        type: String,
        required: [true, 'Please provide a branch'],
    },
    course: {
        type: String,
        required: [true, 'Please provide a course'],
    },
    year: {
        type: Number,
        required: [true, 'Please provide a year'],
    },
    profilePicture: {
        type: String, // Cloudinary URL
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        default: 'student',
    },
    joinedClubs: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Club'
    }]
}, { timestamps: true });

studentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

studentSchema.methods.isPasswordCorrect = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export const Student = mongoose.model('Student', studentSchema);
