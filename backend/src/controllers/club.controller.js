import { Club } from '../models/Club.js';
import { Student } from '../models/Student.js';
import { Organiser } from '../models/Organiser.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getClubs = asyncHandler(async (req, res) => {
    const clubs = await Club.find().populate('createdBy', 'name email').populate('members', 'name');
    res.status(200).json(new ApiResponse(200, clubs, 'Clubs fetched successfully'));
});

export const getClubById = asyncHandler(async (req, res) => {
    const club = await Club.findById(req.params.id).populate('createdBy', 'name email').populate('members', 'name');
    if (!club) {
        throw new ApiError(404, 'Club not found');
    }
    res.status(200).json(new ApiResponse(200, club, 'Club fetched successfully'));
});

export const joinClub = asyncHandler(async (req, res) => {

    if (req.user.role !== 'student') {
        throw new ApiError(403, 'Only students can join clubs');
    }

    const club = await Club.findById(req.params.id);
    if (!club) {
        throw new ApiError(404, 'Club not found');
    }

    if (club.members.includes(req.user.id)) {
        throw new ApiError(400, 'You are already a member of this club');
    }

    club.members.push(req.user.id);
    await club.save();

    const student = await Student.findById(req.user.id);
    student.joinedClubs.push(club._id);
    await student.save();

    res.status(200).json(new ApiResponse(200, club, 'Joined club successfully'));
});

export const createClub = asyncHandler(async (req, res) => {

    if (req.user.role !== 'organiser') {
        throw new ApiError(403, 'Only organisers can create clubs');
    }

    const { name, description } = req.body;
    
    if (!name || !description) {
        throw new ApiError(400, 'Please provide name and description');
    }

    const club = await Club.create({
        name,
        description,
        createdBy: req.user.id,
        members: []
    });

    const organiser = await Organiser.findById(req.user.id);
    organiser.createdClubs.push(club._id);
    await organiser.save();

    res.status(201).json(new ApiResponse(201, club, 'Club created successfully'));
});
