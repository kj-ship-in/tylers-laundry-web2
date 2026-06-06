/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const handleUploadError = (
  error: any,
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        message: 'File too large. Maximum size allowed is 5MB.',
      });
      return;
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        message: 'Unexpected field name. Use "image" as the field name.',
      });
      return;
    }
    res.status(400).json({
      message: `Upload error: ${error.message}`,
    });
    return;
  }

  if (error.message === 'Only JPEG and PNG are allowed') {
    res.status(400).json({
      message: 'Invalid file type. Only JPEG and PNG images are allowed.',
    });
    return;
  }

  next(error);
};
