import { Router } from 'express';
import { 
    studentRegister, studentLogin, getStudentProfile, updateStudentProfile,
    organiserRegister, organiserLogin, getOrganiserProfile, updateOrganiserProfile
} from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/v1/auth/student/register:
 *   post:
 *     summary: Register a new student
 *     tags: [Auth - Student]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               rollNumber:
 *                 type: string
 *               branch:
 *                 type: string
 *               course:
 *                 type: string
 *               year:
 *                 type: number
 *     responses:
 *       201:
 *         description: Successfully registered
 */
router.post('/student/register', authLimiter, studentRegister);

/**
 * @swagger
 * /api/v1/auth/student/login:
 *   post:
 *     summary: Login student
 *     tags: [Auth - Student]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
 */
router.post('/student/login', authLimiter, studentLogin);

/**
 * @swagger
 * /api/v1/auth/student/profile:
 *   get:
 *     summary: Get current student profile
 *     tags: [Auth - Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student details
 *   put:
 *     summary: Update student profile
 *     tags: [Auth - Student]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.get('/student/profile', verifyJWT, getStudentProfile);
router.put('/student/profile', verifyJWT, upload.single('profilePicture'), updateStudentProfile);

/**
 * @swagger
 * /api/v1/auth/organiser/register:
 *   post:
 *     summary: Register a new club organiser
 *     tags: [Auth - Organiser]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               rollNumber:
 *                 type: string
 *               branch:
 *                 type: string
 *               course:
 *                 type: string
 *               year:
 *                 type: number
 *     responses:
 *       201:
 *         description: Successfully registered
 */
router.post('/organiser/register', authLimiter, organiserRegister);

/**
 * @swagger
 * /api/v1/auth/organiser/login:
 *   post:
 *     summary: Login organiser
 *     tags: [Auth - Organiser]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
 */
router.post('/organiser/login', authLimiter, organiserLogin);

/**
 * @swagger
 * /api/v1/auth/organiser/profile:
 *   get:
 *     summary: Get current organiser profile
 *     tags: [Auth - Organiser]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organiser details
 *   put:
 *     summary: Update organiser profile
 *     tags: [Auth - Organiser]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.get('/organiser/profile', verifyJWT, getOrganiserProfile);
router.put('/organiser/profile', verifyJWT, upload.single('profilePicture'), updateOrganiserProfile);

export default router;
