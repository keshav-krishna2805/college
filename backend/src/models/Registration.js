import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
    event: { 
        type: mongoose.Schema.ObjectId, 
        ref: 'Event', 
        required: true, 
        index: true 
    },
    registeredBy: { 
        type: mongoose.Schema.ObjectId, 
        ref: 'Student', 
        required: true, 
        index: true 
    },
    teamName: { 
        type: String, 
        default: null 
    },
    members: { 
        type: [{ 
            student: { type: mongoose.Schema.ObjectId, ref: 'Student' }, 
            name: { type: String } 
        }], 
        default: [] 
    },
    paymentStatus: { 
        type: String, 
        enum: ['notApplicable', 'pending', 'paid', 'refunded'],
        default: 'notApplicable' 
    },
    status: { 
        type: String, 
        enum: ['confirmed', 'waitlisted', 'cancelled'],
        default: 'confirmed', 
        index: true 
    },
}, { timestamps: true });

registrationSchema.index({ event: 1, registeredBy: 1 }, { unique: true });

export const Registration = mongoose.model('Registration', registrationSchema);
