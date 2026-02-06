import { Request, Response } from 'express';

export class HealthController {
  check = (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  };
}
