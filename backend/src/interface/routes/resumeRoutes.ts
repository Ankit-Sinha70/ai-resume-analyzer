import { Router } from 'express';
import { ResumeController } from '../controllers';
import { upload } from '../middleware';

const router = Router();
const resumeController = new ResumeController();

// POST /api/analyze - Analyze resume against job description
router.post('/analyze', upload.single('resume'), resumeController.analyze);

// POST /api/analyze/quality - Check resume quality
router.post('/analyze/quality', upload.single('resume'), resumeController.checkQuality);


export default router;
