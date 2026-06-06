/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'path';

import { Request } from 'express';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (_: Request, __: any, cb: any) => {
    cb(null, 'uploads/');
  },
  filename: (_: Request, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_: Request, file: any, cb: any) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPEG and PNG are allowed'));
    }
    cb(null, true);
  },
});
