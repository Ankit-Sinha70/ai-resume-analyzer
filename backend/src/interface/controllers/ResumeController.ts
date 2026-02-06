import { Request, Response, NextFunction } from 'express';
import { AnalyzeResume } from '../../application/use-cases';
import { logger } from '../../infrastructure';

export class ResumeController {
  private analyzeResume: AnalyzeResume;

  constructor() {
    this.analyzeResume = new AnalyzeResume();
  }

  analyze = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate file upload
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No resume file uploaded. Please upload a PDF file.',
        });
        return;
      }

      // Validate job description
      const jobDescription = req.body.jobDescription;
      if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Job description is required.',
        });
        return;
      }

      if (jobDescription.trim().length < 50) {
        res.status(400).json({
          success: false,
          error: 'Job description is too short. Please provide a more detailed description.',
        });
        return;
      }

      logger.info('Received analysis request', {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        jobDescriptionLength: jobDescription.length,
      });

      // Execute analysis
      const result = await this.analyzeResume.execute({
        resumeBuffer: req.file.buffer,
        fileName: req.file.originalname,
        jobDescription: jobDescription.trim(),
      });

      res.status(200).json({
        success: true,
        data: result.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  };
}
