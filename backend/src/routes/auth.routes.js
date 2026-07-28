import { Router } from 'express';
import { 
    studentRegister, loginUser, getUserProfile, updateUserProfile,
    getStudentProfile, updateStudentProfile,
    organiserRegister, getOrganiserProfile, updateOrganiserProfile
} from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// Registration & Login
router.post('/student/register', authLimiter, studentRegister);
router.post('/organiser/register', authLimiter, organiserRegister);
router.post('/login', authLimiter, loginUser);

// Generic / Common Profile Endpoints (Works for any role)
router.get('/profile', verifyJWT, getUserProfile);
router.put('/profile', verifyJWT, upload.single('profilePicture'), updateUserProfile);
router.get('/me', verifyJWT, getUserProfile);
router.put('/me', verifyJWT, upload.single('profilePicture'), updateUserProfile);

// Role Specific Profile Endpoints
router.get('/student/profile', verifyJWT, getStudentProfile);
router.put('/student/profile', verifyJWT, upload.single('profilePicture'), updateStudentProfile);

router.get('/organiser/profile', verifyJWT, getOrganiserProfile);
router.put('/organiser/profile', verifyJWT, upload.single('profilePicture'), updateOrganiserProfile);

export default router;
