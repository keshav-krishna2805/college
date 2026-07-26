import mongoose from 'mongoose';

export const EVENT_MODE = ['offline', 'online', 'hybrid'];
export const EVENT_TYPE = ['free', 'paid'];
export const EVENT_STATUS = [
    'draft', 
    'pendingApproval', 
    'approved', 
    'rejected', 
    'live', 
    'completed', 
    'cancelled',
    'active', 
    'open', 
    'close', 
    'closed'
];
export const ELIGIBILITY = ['all', 'specificDepartment', 'specificYear', 'inviteOnly'];

const eventSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Event title is required'], 
        maxlength: [150, 'Title cannot exceed 150 characters'],
        trim: true
    },
    slug: { 
        type: String, 
        unique: true,
        index: true
    },
    description: { 
        type: String, 
        required: [true, 'Description is required'], 
        maxlength: [5000, 'Description cannot exceed 5000 characters'] 
    },
    category: { 
        type: String, 
        required: [true, 'Event category is required'], 
        index: true 
    },
    tags: { 
        type: [String], 
        default: [] 
    },
    coverImageUrl: { 
        type: String, 
        default: null 
    },
    eventDate: { 
        type: Date, 
        required: [true, 'Event date is required'], 
        index: true 
    },
    startTime: { 
        type: String, 
        required: [true, 'Start time is required']
    },
    endTime: { 
        type: String, 
        required: [true, 'End time is required']
    },
    location: {
        mode: { 
            type: String, 
            enum: EVENT_MODE, 
            required: [true, 'Event mode is required'] 
        },
        venue: { 
            type: String,
            default: null
        },
        meetingLink: { 
            type: String,
            default: null
        }
    },
    contact: {
        organizingClub: { 
            type: String, 
            required: [true, 'Organizing club name is required'] 
        },
        name: { 
            type: String, 
            required: [true, 'Contact person name is required'] 
        },
        email: { 
            type: String, 
            required: [true, 'Contact email is required'] 
        },
        phone: { 
            type: String, 
            required: [true, 'Contact phone is required'] 
        },
        socialLink: { 
            type: String, 
            default: null 
        }
    },
    registration: {
        deadline: { 
            type: Date, 
            required: [true, 'Registration deadline is required'] 
        },
        maxParticipants: { 
            type: Number, 
            required: [true, 'Max participants is required'], 
            min: [1, 'Max participants must be at least 1'] 
        },
        type: { 
            type: String, 
            enum: EVENT_TYPE, 
            required: [true, 'Event type is required'] 
        },
        ticketPrice: { 
            type: Number, 
            min: [0, 'Ticket price cannot be negative'],
            default: 0
        },
        team: {
            isTeamEvent: { type: Boolean, default: false },
            minSize: { type: Number, default: null },
            maxSize: { type: Number, default: null }
        }
    },
    eligibility: {
        type: { 
            type: String, 
            enum: ELIGIBILITY, 
            required: [true, 'Eligibility type is required'] 
        },
        departments: { 
            type: [String], 
            default: [] 
        }
    },
    notes: { 
        type: String, 
        maxlength: [2000, 'Notes cannot exceed 2000 characters'], 
        default: '' 
    },
    agreedToTerms: { 
        type: Boolean, 
        required: [true, 'You must agree to terms to submit'],
        validate: {
            validator: function(val) {
                return val === true;
            },
            message: 'agreedToTerms must be true'
        }
    },
    organizingClubRef: { 
        type: mongoose.Schema.ObjectId, 
        ref: 'Club', 
        required: [true, 'Organizing Club ID reference is required'], 
        index: true 
    },
    createdBy: { 
        type: mongoose.Schema.ObjectId, 
        ref: 'Organiser', 
        required: [true, 'CreatedBy ID is required'], 
        index: true 
    },
    approvedBy: { 
        type: mongoose.Schema.ObjectId, 
        ref: 'Admin', 
        default: null 
    },
    status: { 
        type: String, 
        enum: EVENT_STATUS, 
        default: 'open',
        index: true 
    },
    rejectionReason: { 
        type: String, 
        default: null 
    },
    participantsCount: { 
        type: Number, 
        default: 0 
    },
    numberOfRegistration: { 
        type: Number, 
        default: 0 
    },
    numberOfPeopleCome: { 
        type: Number, 
        default: 0 
    },
    userComeList: [{ 
        type: mongoose.Schema.ObjectId, 
        ref: 'Student' 
    }],
    viewsCount: { 
        type: Number, 
        default: 0 
    },
    isDeleted: { 
        type: Boolean, 
        default: false, 
        index: true 
    }
}, { timestamps: true });

eventSchema.pre('save', function(next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') + '-' + Date.now();
    }
    next();
});

export const Event = mongoose.model('Event', eventSchema);
