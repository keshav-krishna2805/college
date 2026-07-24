import { Router } from 'express';
import { getClubs, getClubById, joinClub, createClub } from '../controllers/club.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.get('/', verifyJWT, getClubs);

router.post('/', verifyJWT, authorizeRoles(ROLES.ORGANIZER, ROLES.ADMIN), createClub);

router.get('/:id', verifyJWT, getClubById);

router.post('/:id/join', verifyJWT, joinClub);

export default router;
