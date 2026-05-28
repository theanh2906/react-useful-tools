import express from 'express';
import { shareScheduleHandler } from '../controllers/scheduleController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Share schedule route
router.post('/share', authenticate, shareScheduleHandler);

export default router;