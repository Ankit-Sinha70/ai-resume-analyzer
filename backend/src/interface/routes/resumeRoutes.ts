import { Router } from 'express';
import { ResumeController } from '../controllers';
import { upload } from '../middleware';

const router = Router();
const resumeController = new ResumeController();

// POST /api/analyze - Analyze resume against job description
router.post('/analyze', upload.single('resume'), resumeController.analyze);

export default router;
