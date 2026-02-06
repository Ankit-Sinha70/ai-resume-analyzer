import { Router } from 'express';
import { HealthController } from '../controllers';

const router = Router();
const healthController = new HealthController();

// GET /api/health - Health check
router.get('/health', healthController.check);

export default router;
