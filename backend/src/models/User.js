import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
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
    website: {
        type: String,
        default: '',
    },
    username: {
        type: String,
        default: '',
    },
    phoneNumber: {
        type: String,
        default: '',
    },
    rollNumber: {
        type: String,
        unique: true,
        sparse: true,
        uppercase: true,
        trim: true,
    },
    branch: {
        type: String,
        default: '',
    },
    course: {
        type: String,
        default: '',
    },
    year: {
        type: Number,
    },
    clubName: {
        type: String,
        default: '',
        trim: true,
    },
    category: {
        type: String,
        default: '',
    },
    facultyName: {
        type: String,
        default: '',
        trim: true,
    },
    facultyEmail: {
        type: String,
        default: '',
        lowercase: true,
        trim: true,
    },
    isOfficialClub: {
        type: Boolean,
        default: false,
    },
    logoPath: {
        type: String,
        default: '',
    },
    clubDescription: {
        type: String,
        default: '',
    },
    profilePicture: {
        type: String,
        default: '',
    },
    bio: {
        type: String,
        default: '',
    },
    role: {
        type: String,
        enum: ['student', 'organiser', 'admin'],
        default: 'student',
    },
    events:{
        type:Number,
        default:0
    },
    members:{
        type:Number,
        default:0
    },
    followers:{
        type:Number,
        default:0
    },
    joinedClubs: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Club',
    }],
    createdClubs: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Club',
    }],
    refreshToken: {
        type: String,
        select: false,
    },
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
