import { Request, Response } from 'express';
import { getCloudinaryAuthParams } from '@config/cloudinary';
import { asyncHandler } from '@utils/asyncHandler';

/**
 * The frontend uploads the user's photo directly to Cloudinary (not through
 * this backend) to avoid proxying large files and to keep "upload to result"
 * fast. It needs a fresh signature to do that, which is
 * what this endpoint issues. Never expose API_SECRET to the client
 * directly - this is the only safe way to hand out upload permission.
 */
export const getUploadAuthHandler = asyncHandler(async (_req: Request, res: Response) => {
  const authParams = getCloudinaryAuthParams();

  res.status(200).json({
    success: true,
    data: authParams,
  });
});
