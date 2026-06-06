import { z } from 'zod';

export const UpdateProfileDetailsSchema = z.object({
  name: z.string().optional(),
  email: z.email().optional(),
});

export const UpdateProfilePictureSchema = z.object({
  profileUrl: z.string().url({ message: 'Must be a valid URL' }),
});

export const UserIdSchema = z.object({
  userId: z.number().int().positive(),
});
