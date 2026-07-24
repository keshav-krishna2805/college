import { Router } from 'express';
import { getClubs, getClubById, joinClub, createClub } from '../controllers/club.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/index.js';

const router = Router();

/**
 * @swagger
 * /api/v1/clubs:
 *   get:
 *     summary: Get all clubs
 *     tags: [Clubs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of clubs
 */
router.get('/', verifyJWT, getClubs);

/**
 * @swagger
 * /api/v1/clubs:
 *   post:
 *     summary: Create a new club (Organisers only)
 *     tags: [Clubs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Club created successfully
 */
router.post('/', verifyJWT, authorizeRoles(ROLES.ORGANIZER, ROLES.ADMIN), createClub);

/**
 * @swagger
 * /api/v1/clubs/{id}:
 *   get:
 *     summary: Get a club by ID
 *     tags: [Clubs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Club details
 */
router.get('/:id', verifyJWT, getClubById);

/**
 * @swagger
 * /api/v1/clubs/{id}/join:
 *   post:
 *     summary: Join a club
 *     tags: [Clubs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Joined club successfully
 */
router.post('/:id/join', verifyJWT, joinClub);

export default router;
