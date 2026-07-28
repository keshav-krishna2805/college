import { Club } from '../models/Club.js';
import { User } from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getClubs = asyncHandler(async (req, res) => {
    const clubs = await Club.find().populate('createdBy', 'name email role clubName category').populate('members', 'name email rollNumber');
    res.status(200).json(new ApiResponse(200, clubs, 'Clubs fetched successfully'));
});

export const getClubById = asyncHandler(async (req, res) => {
    const club = await Club.findById(req.params.id).populate('createdBy', 'name email role clubName category').populate('members', 'name email rollNumber');
    if (!club) {
        throw new ApiError(404, 'Club not found');
    }
    res.status(200).json(new ApiResponse(200, club, 'Club fetched successfully'));
});

export const joinClub = asyncHandler(async (req, res) => {
    if (req.user.role !== 'student') {
        throw new ApiError(403, 'Only students can join clubs');
    }

    const userId = req.user.id || req.user._id;
    const club = await Club.findById(req.params.id);
    if (!club) {
        throw new ApiError(404, 'Club not found');
    }

    const isAlreadyMember = club.members.some(memberId => memberId.toString() === userId.toString());
    if (isAlreadyMember) {
        throw new ApiError(400, 'You are already a member of this club');
    }

    club.members.push(userId);
    await club.save();

    const student = await User.findById(userId);
    if (student) {
        const hasJoined = student.joinedClubs.some(cId => cId.toString() === club._id.toString());
        if (!hasJoined) {
            student.joinedClubs.push(club._id);
            await student.save();
        }
    }

    res.status(200).json(new ApiResponse(200, club, 'Joined club successfully'));
});

export const createClub = asyncHandler(async (req, res) => {
    if (req.user.role !== 'organiser') {
        throw new ApiError(403, 'Only organisers can create clubs');
    }

    const userId = req.user.id || req.user._id;
    const { name, description } = req.body;
    
    if (!name || !description) {
        throw new ApiError(400, 'Please provide name and description');
    }

    const club = await Club.create({
        name: name.trim(),
        description: description.trim(),
        createdBy: userId,
        members: []
    });

    const organiser = await User.findById(userId);
    if (organiser) {
        const hasCreated = organiser.createdClubs.some(cId => cId.toString() === club._id.toString());
        if (!hasCreated) {
            organiser.createdClubs.push(club._id);
            await organiser.save();
        }
    }

    res.status(201).json(new ApiResponse(201, club, 'Club created successfully'));
});
