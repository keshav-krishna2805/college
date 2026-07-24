import { Router } from 'express';
import { 
    studentRegister, studentLogin, getStudentProfile, updateStudentProfile,
    organiserRegister, organiserLogin, getOrganiserProfile, updateOrganiserProfile
} from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.post('/student/register', authLimiter, studentRegister);

router.post('/student/login', authLimiter, studentLogin);

router.get('/student/profile', verifyJWT, getStudentProfile);
router.put('/student/profile', verifyJWT, upload.single('profilePicture'), updateStudentProfile);

router.post('/organiser/register', authLimiter, organiserRegister);

router.post('/organiser/login', authLimiter, organiserLogin);

router.get('/organiser/profile', verifyJWT, getOrganiserProfile);
router.put('/organiser/profile', verifyJWT, upload.single('profilePicture'), updateOrganiserProfile);

export default router;
