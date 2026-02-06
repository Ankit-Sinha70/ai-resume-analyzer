import multer from 'multer';
import { Request } from 'express';
import { CONSTANTS } from '../../config';

// Configure multer for memory storage (no disk write)
const storage = multer.memoryStorage();

// File filter to accept only PDFs
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  if (CONSTANTS.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('Only PDF files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: CONSTANTS.MAX_FILE_SIZE,
  },
});
