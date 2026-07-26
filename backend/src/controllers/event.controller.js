import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import { Club } from '../models/Club.js';
import { Student } from '../models/Student.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createEvent = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        category,
        tags,
        coverImageUrl,
        eventDate,
        startTime,
        endTime,
        location,
        contact,
        registration,
        eligibility,
        notes,
        agreedToTerms,
        organizingClubRef,
        status
    } = req.body;

    if (agreedToTerms !== true) {
        throw new ApiError(400, 'agreedToTerms must be true to submit the event.');
    }

    if (startTime && endTime) {
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        const startInMinutes = startHour * 60 + startMin;
        const endInMinutes = endHour * 60 + endMin;
        if (endInMinutes <= startInMinutes) {
            throw new ApiError(400, 'End time must be after start time.');
        }
    }

    if (eventDate && registration?.deadline) {
        if (new Date(registration.deadline) > new Date(eventDate)) {
            throw new ApiError(400, 'Registration deadline must be on or before the event date.');
        }
    }

    if (location?.mode !== 'online' && !location?.venue) {
        throw new ApiError(400, 'Venue is required unless event mode is online.');
    }
    if (location?.mode !== 'offline' && !location?.meetingLink) {
        throw new ApiError(400, 'Meeting link is required unless event mode is offline.');
    }

    if (registration?.type === 'paid') {
        if (registration.ticketPrice === undefined || registration.ticketPrice < 0) {
            throw new ApiError(400, 'Ticket price is required and must be >= 0 for paid events.');
        }
    }

    if (registration?.team?.isTeamEvent === true) {
        const { minSize, maxSize } = registration.team;
        if (!minSize || !maxSize) {
            throw new ApiError(400, 'Both minSize and maxSize are required for team events.');
        }
        if (maxSize < minSize) {
            throw new ApiError(400, 'maxSize must be greater than or equal to minSize.');
        }
    }

    if (eligibility?.type === 'specificDepartment') {
        if (!eligibility.departments || eligibility.departments.length === 0) {
            throw new ApiError(400, 'At least one department must be provided for specificDepartment eligibility.');
        }
    }

    const clubExists = await Club.findById(organizingClubRef);
    if (!clubExists) {
        throw new ApiError(404, 'Organizing club not found.');
    }

    const event = await Event.create({
        title,
        description,
        category,
        tags: tags || [],
        coverImageUrl: coverImageUrl || null,
        eventDate,
        startTime,
        endTime,
        location,
        contact,
        registration,
        eligibility,
        notes: notes || '',
        agreedToTerms,
        organizingClubRef,
        createdBy: req.user ? req.user.id : clubExists.createdBy,
        status: status || 'open',
        participantsCount: 0,
        numberOfRegistration: 0,
        numberOfPeopleCome: 0,
        userComeList: []
    });

    const createdEvent = await Event.findById(event._id)
        .populate({
            path: 'organizingClubRef',
            select: 'name description createdBy members',
            populate: {
                path: 'createdBy',
                select: 'name email phoneNumber rollNumber branch course year profilePicture bio role'
            }
        })
        .populate('createdBy', 'name email phoneNumber rollNumber branch course year profilePicture bio role');

    res.status(201).json(new ApiResponse(201, createdEvent, 'Event created successfully'));
});

export const getEvents = asyncHandler(async (req, res) => {
    const {
        search,
        status,
        category,
        mode,
        organizingClubRef,
        eventType,
        eligibilityType,
        page = 1,
        limit = 20
    } = req.query;

    const query = { isDeleted: false };

    if (status) {
        query.status = status;
    }

    if (category) {
        query.category = category;
    }

    if (mode) {
        query['location.mode'] = mode;
    }

    if (organizingClubRef) {
        query.organizingClubRef = organizingClubRef;
    }

    if (eventType) {
        query['registration.type'] = eventType;
    }

    if (eligibilityType) {
        query['eligibility.type'] = eligibilityType;
    }

    if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
            { title: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
            { tags: { $in: [searchRegex] } }
        ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const events = await Event.find(query)
        .populate({
            path: 'organizingClubRef',
            select: 'name description createdBy members',
            populate: {
                path: 'createdBy',
                select: 'name email phoneNumber rollNumber branch course year profilePicture bio role'
            }
        })
        .populate('createdBy', 'name email phoneNumber rollNumber branch course year profilePicture bio role')
        .sort({ eventDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    const total = await Event.countDocuments(query);

    res.status(200).json(new ApiResponse(200, {
        events,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
        }
    }, 'Events fetched successfully'));
});

export const getEventById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
    query.isDeleted = false;

    const event = await Event.findOne(query)
        .populate({
            path: 'organizingClubRef',
            select: 'name description createdBy members',
            populate: {
                path: 'createdBy',
                select: 'name email phoneNumber rollNumber branch course year profilePicture bio role'
            }
        })
        .populate('createdBy', 'name email phoneNumber rollNumber branch course year profilePicture bio role')
        .populate('userComeList', 'name email rollNumber branch profilePicture');

    if (!event) {
        throw new ApiError(404, 'Event not found');
    }

    Event.findByIdAndUpdate(event._id, { $inc: { viewsCount: 1 } }).exec();

    res.status(200).json(new ApiResponse(200, event, 'Event fetched successfully'));
});

export const markUserCome = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    const targetUserId = userId || (req.user ? req.user.id : null);

    if (!targetUserId) {
        throw new ApiError(400, 'Please provide userId in request body or authenticate.');
    }

    const event = await Event.findById(id);
    if (!event || event.isDeleted) {
        throw new ApiError(404, 'Event not found.');
    }

    const alreadyCame = event.userComeList.some(
        (user) => user.toString() === targetUserId.toString()
    );

    if (alreadyCame) {
        return res.status(200).json(
            new ApiResponse(200, event, 'User attendance already recorded for this event.')
        );
    }

    const updatedEvent = await Event.findByIdAndUpdate(
        id,
        {
            $addToSet: { userComeList: targetUserId },
            $inc: { numberOfPeopleCome: 1 }
        },
        { new: true }
    )
        .populate({
            path: 'organizingClubRef',
            select: 'name description createdBy members',
            populate: {
                path: 'createdBy',
                select: 'name email phoneNumber rollNumber branch course year profilePicture bio role'
            }
        })
        .populate('createdBy', 'name email phoneNumber rollNumber branch course year profilePicture bio role')
        .populate('userComeList', 'name email rollNumber branch profilePicture');

    res.status(200).json(
        new ApiResponse(200, updatedEvent, 'User attendance recorded successfully.')
    );
});

export const registerForEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { teamName, members } = req.body;

    const studentId = req.user ? req.user.id : req.body.studentId;
    if (!studentId) {
        throw new ApiError(401, 'Authentication required to register for an event.');
    }

    const event = await Event.findById(id);
    if (!event || event.isDeleted) {
        throw new ApiError(404, 'Event not found.');
    }

    if (event.status === 'closed' || event.status === 'close' || event.status === 'cancelled') {
        throw new ApiError(400, 'Registration is closed for this event.');
    }

    if (event.participantsCount >= event.registration.maxParticipants) {
        throw new ApiError(400, 'Event has reached maximum participant capacity.');
    }

    const existingReg = await Registration.findOne({ event: id, registeredBy: studentId });
    if (existingReg) {
        throw new ApiError(400, 'You are already registered for this event.');
    }

    const registration = await Registration.create({
        event: id,
        registeredBy: studentId,
        teamName: teamName || null,
        members: members || [],
        paymentStatus: event.registration.type === 'paid' ? 'pending' : 'notApplicable',
        status: 'confirmed'
    });

    await Event.findByIdAndUpdate(id, {
        $inc: {
            participantsCount: 1,
            numberOfRegistration: 1
        }
    });

    res.status(201).json(new ApiResponse(201, registration, 'Registered for event successfully.'));
});
