import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { config } from '../config/env.config.js';

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn
    });
};

export const studentRegister = asyncHandler(async (req, res) => {
    const { name, email, password, phoneNumber, phone, rollNumber, branch, course, year } = req.body;
    const contactPhone = phoneNumber || phone;

    if (!name || !email || !password || !contactPhone || !rollNumber || !branch || !course || !year) {
        throw new ApiError(400, 'Please provide all required fields');
    }

    const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { rollNumber: rollNumber.toUpperCase() }]
    });

    if (existingUser) {
        throw new ApiError(400, 'User with this email or roll number already exists');
    }

    const student = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        phoneNumber: contactPhone.trim(),
        rollNumber: rollNumber.toUpperCase().trim(),
        branch: branch.trim(),
        course: course.trim(),
        year: Number(year),
        role: 'student'
    });

    const token = generateToken(student._id, 'student');

    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.status(201).json(new ApiResponse(201, { user: studentResponse, student: studentResponse, token }, 'Student registered successfully'));
});

export const organiserRegister = asyncHandler(async (req, res) => {
    const {
        clubName,
        email,
        password,
        category,
        description,
        clubDescription,
        phone,
        phoneNumber,
        facultyName,
        facultyEmail,
        name
    } = req.body;

    const contactPhone = phoneNumber || phone;
    const desc = clubDescription || description;

    // Validation
    if (
        !clubName ||
        !email ||
        !password ||
        !category ||
        !desc ||
        !contactPhone ||
        !facultyName ||
        !facultyEmail
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // Check existing organiser/user
    const existingOrganiser = await User.findOne({ email: email.toLowerCase() });

    if (existingOrganiser) {
        throw new ApiError(400, "User already exists with this email");
    }

    // Create organiser in common User database collection
    const organiser = await User.create({
        name: (name || clubName).trim(),
        clubName: clubName.trim(),
        email: email.toLowerCase().trim(),
        password,
        category: category.trim(),
        clubDescription: desc.trim(),
        phoneNumber: contactPhone.trim(),
        facultyName: facultyName.trim(),
        facultyEmail: facultyEmail.toLowerCase().trim(),
        role: 'organiser'
    });

    const token = generateToken(organiser._id, "organiser");

    const organiserResponse = organiser.toObject();
    delete organiserResponse.password;

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                user: organiserResponse,
                organiser: organiserResponse,
                token,
            },
            "Organiser registered successfully"
        )
    );
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, 'Please provide email and password');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user || !(await user.isPasswordCorrect(password))) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const token = generateToken(user._id, user.role);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json(new ApiResponse(200, { user: userResponse, token }, 'Login successful'));
});

// Common Profile Endpoint (For any logged in user)
export const getUserProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    let query = User.findById(userId);

    if (req.user.role === 'student') {
        query = query.populate('joinedClubs', 'name description');
    } else if (req.user.role === 'organiser') {
        query = query.populate('createdClubs', 'name description');
    }

    const user = await query;
    if (!user) {
        throw new ApiError(404, 'User profile not found');
    }

    res.status(200).json(new ApiResponse(200, user, 'Profile fetched successfully'));
});

// Common Update Profile Endpoint
export const updateUserProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const {
        name,
        username,
        website,
        bio,
        phone,
        phoneNumber,
        rollNumber,
        branch,
        course,
        year,
        clubName,
        category,
        description,
        clubDescription,
        facultyName,
        facultyEmail
    } = req.body;

    // Common Profile Fields
    if (name !== undefined) user.name = name.trim();
    if (username !== undefined) user.username = username.trim();
    if (website !== undefined) user.website = website.trim();
    if (bio !== undefined) user.bio = bio.trim();

    const contactPhone = phoneNumber || phone;
    if (contactPhone !== undefined) user.phoneNumber = contactPhone.trim();

    // Student Fields
    if (rollNumber !== undefined) user.rollNumber = rollNumber.trim().toUpperCase();
    if (branch !== undefined) user.branch = branch.trim();
    if (course !== undefined) user.course = course.trim();
    if (year !== undefined) {
        const parsedYear = Number(year);
        if (!Number.isNaN(parsedYear)) user.year = parsedYear;
    }

    // Organiser Fields
    if (clubName !== undefined) user.clubName = clubName.trim();
    if (category !== undefined) user.category = category.trim();
    const desc = clubDescription || description;
    if (desc !== undefined) user.clubDescription = desc.trim();
    if (facultyName !== undefined) user.facultyName = facultyName.trim();
    if (facultyEmail !== undefined) user.facultyEmail = facultyEmail.trim().toLowerCase();

    // Avatar / Profile picture update via Cloudinary
    if (req.file) {
        const { uploadOnCloudinary } = await import('../config/cloudinary.js');
        const avatar = await uploadOnCloudinary(req.file.path);
        if (avatar) {
            user.profilePicture = avatar.secure_url;
            if (user.role === 'organiser') {
                user.logoPath = avatar.secure_url;
            }
        }
    }

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.status(200).json(new ApiResponse(200, updatedUser, 'Profile updated successfully'));
});

// Role-specific profile getters & updaters
export const getStudentProfile = asyncHandler(async (req, res) => {
    if (req.user.role !== 'student') {
        throw new ApiError(403, 'Forbidden. Only students can access this profile.');
    }
    const userId = req.user.id || req.user._id;
    const student = await User.findById(userId).populate('joinedClubs', 'name description');
    if (!student) {
        throw new ApiError(404, 'Student profile not found');
    }
    res.status(200).json(new ApiResponse(200, student, 'Student profile fetched successfully'));
});

export const updateStudentProfile = asyncHandler(async (req, res) => {
    if (req.user.role !== 'student') {
        throw new ApiError(403, 'Forbidden. Only students can access this profile.');
    }
    return updateUserProfile(req, res);
});

export const getOrganiserProfile = asyncHandler(async (req, res) => {
    if (req.user.role !== 'organiser') {
        throw new ApiError(403, 'Forbidden. Only organisers can access this profile.');
    }
    const userId = req.user.id || req.user._id;
    const organiser = await User.findById(userId).populate('createdClubs', 'name description');
    if (!organiser) {
        throw new ApiError(404, 'Organiser profile not found');
    }
    res.status(200).json(new ApiResponse(200, organiser, 'Organiser profile fetched successfully'));
});

export const updateOrganiserProfile = asyncHandler(async (req, res) => {
    if (req.user.role !== 'organiser') {
        throw new ApiError(403, 'Forbidden. Only organisers can access this profile.');
    }
    return updateUserProfile(req, res);
});
