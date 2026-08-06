import { z } from 'zod';

// Path or ID Cloudinary returns after upload
// Cloudinary public IDs don't necessarily start with / and can contain letters, numbers, -, _, /
const safeFilePath = z
  .string()
  .min(1)
  .max(500)
  .regex(/^[a-zA-Z0-9/_\-.]+$/, 'Invalid file path');

export const createCardSchema = z.object({
  format: z.enum(['pfp-frame', 'builder-id']),
  cloudinaryPublicId: safeFilePath,
  name: z.string().trim().min(1).max(60).optional(),
  teamName: z.string().trim().min(1).max(60).optional(),
  role: z.string().trim().min(1).max(60).optional(),
  builderTitle: z.string().trim().min(1).max(80).optional(),
}).superRefine((data, ctx) => {
  if (data.format === 'builder-id' && (!data.name || !data.role || !data.teamName)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'name, teamName and role are required for the builder-id format',
      path: ['name'],
    });
  }
});

export const cardIdParamSchema = z.object({
  cardId: z
    .string()
    .min(6)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid card id'),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
