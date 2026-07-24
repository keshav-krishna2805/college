import jwt from 'jsonwebtoken';
import { Student } from '../models/Student.js';
import { Organiser } from '../models/Organiser.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { config } from '../config/env.config.js';

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn
    });
};

// ==========================================
// STUDENT AUTHENTICATION
// ==========================================

export const studentRegister = asyncHandler(async (req, res) => {
    const { name, email, password, phoneNumber, rollNumber, branch, course, year } = req.body;

    const studentExists = await Student.findOne({ 
        $or: [{ email }, { rollNumber }] 
    });

    if (studentExists) {
        throw new ApiError(400, 'Student with this email or roll number already exists');
    }

    const student = await Student.create({
        name,
        email,
        password,
        phoneNumber,
        rollNumber,
        branch,
        course,
        year
    });

    const token = generateToken(student._id, 'student');

    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.status(201).json(new ApiResponse(201, { student: studentResponse, token }, 'Student registered successfully'));
});

export const studentLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, 'Please provide email and password');
    }

    const student = await Student.findOne({ email }).select('+password');

    if (!student || !(await student.isPasswordCorrect(password))) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const token = generateToken(student._id, 'student');

    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.status(200).json(new ApiResponse(200, { student: studentResponse, token }, 'Login successful'));
});

export const getStudentProfile = asyncHandler(async (req, res) => {
    if (req.user.role !== 'student') {
        throw new ApiError(403, 'Forbidden. Only students can access this profile.');
    }
    
    const student = await Student.findById(req.user.id).populate('joinedClubs', 'name');
    if (!student) {
        throw new ApiError(404, 'Student not found');
    }
    res.status(200).json(new ApiResponse(200, student, 'Student profile fetched successfully'));
});

export const updateStudentProfile = asyncHandler(async (req, res) => {
    if (req.user.role !== 'student') {
        throw new ApiError(403, 'Forbidden. Only students can access this profile.');
    }

    const { bio } = req.body;
    const student = await Student.findById(req.user.id);
    if (!student) {
        throw new ApiError(404, 'Student not found');
    }

    if (bio !== undefined) {
        student.bio = bio;
    }

    if (req.file) {
        const { uploadOnCloudinary } = await import('../config/cloudinary.js');
        const avatar = await uploadOnCloudinary(req.file.path);
        if (avatar) {
            student.profilePicture = avatar.secure_url;
        }
    }

    await student.save();
    res.status(200).json(new ApiResponse(200, student, 'Student profile updated successfully'));
});

// ==========================================
// ORGANISER AUTHENTICATION
// ==========================================

export const organiserRegister = asyncHandler(async (req, res) => {
    const { name, email, password, phoneNumber, rollNumber, branch, course, year } = req.body;

    const organiserExists = await Organiser.findOne({ 
        $or: [{ email }, { rollNumber }] 
    });

    if (organiserExists) {
        throw new ApiError(400, 'Organiser with this email or roll number already exists');
    }

    const organiser = await Organiser.create({
        name,
        email,
        password,
        phoneNumber,
        rollNumber,
        branch,
        course,
        year
    });

    const token = generateToken(organiser._id, 'organiser');

    const organiserResponse = organiser.toObject();
    delete organiserResponse.password;

    res.status(201).json(new ApiResponse(201, { organiser: organiserResponse, token }, 'Organiser registered successfully'));
});

export const organiserLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, 'Please provide email and password');
    }

    const organiser = await Organiser.findOne({ email }).select('+password');

    if (!organiser || !(await organiser.isPasswordCorrect(password))) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const token = generateToken(organiser._id, 'organiser');

    const organiserResponse = organiser.toObject();
    delete organiserResponse.password;

    res.status(200).json(new ApiResponse(200, { organiser: organiserResponse, token }, 'Login successful'));
});

export const getOrganiserProfile = asyncHandler(async (req, res) => {
    if (req.user.role !== 'organiser') {
        throw new ApiError(403, 'Forbidden. Only organisers can access this profile.');
    }

    const organiser = await Organiser.findById(req.user.id)
        .populate('createdClubs', 'name');
        
    if (!organiser) {
        throw new ApiError(404, 'Organiser not found');
    }
    res.status(200).json(new ApiResponse(200, organiser, 'Organiser profile fetched successfully'));
});

export const updateOrganiserProfile = asyncHandler(async (req, res) => {
    if (req.user.role !== 'organiser') {
        throw new ApiError(403, 'Forbidden. Only organisers can access this profile.');
    }

    const { bio } = req.body;
    const organiser = await Organiser.findById(req.user.id);
    if (!organiser) {
        throw new ApiError(404, 'Organiser not found');
    }

    if (bio !== undefined) {
        organiser.bio = bio;
    }

    if (req.file) {
        const { uploadOnCloudinary } = await import('../config/cloudinary.js');
        const avatar = await uploadOnCloudinary(req.file.path);
        if (avatar) {
            organiser.profilePicture = avatar.secure_url;
        }
    }

    await organiser.save();
    res.status(200).json(new ApiResponse(200, organiser, 'Organiser profile updated successfully'));
});
