import { Router } from 'express';
import {
    createEvent,
    getEvents,
    getEventById,
    markUserCome,
    registerForEvent
} from '../controllers/event.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.get('/', getEvents);
router.post('/', verifyJWT, authorizeRoles(ROLES.ORGANIZER, ROLES.ADMIN), createEvent);
router.get('/:id', getEventById);
router.post('/:id/attend', verifyJWT, markUserCome);
router.post('/:id/register', verifyJWT, registerForEvent);

export default router;
