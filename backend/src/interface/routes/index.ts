import { Router } from 'express';
import resumeRoutes from './resumeRoutes';
import healthRoutes from './healthRoutes';

const router = Router();

router.use('/', healthRoutes);
router.use('/', resumeRoutes);

export default router;
