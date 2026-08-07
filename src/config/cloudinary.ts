import { v2 as cloudinary } from 'cloudinary';
import { env } from '@config/env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export interface FramedImageOptions {
  format: 'pfp-frame' | 'builder-id';
  name?: string;
  teamName?: string;
  builderTitle?: string;
}

export function buildFramedImageUrl(publicId: string): string {
  // Since the frontend now generates and uploads the fully-rendered ID card,
  // we no longer need to apply face-cropping or overlays on the backend.
  // We just return the direct URL to the uploaded image.
  return cloudinary.url(publicId);
}

export function getCloudinaryAuthParams() {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  // Note: we might not strictly need upload_preset in the signature if it's unsigned, 
  // but if it's signed, we should include it.
  const paramsToSign = {
    timestamp,
    folder: env.CLOUDINARY_FOLDER,
  };
  
  const signature = cloudinary.utils.api_sign_request(paramsToSign, env.CLOUDINARY_API_SECRET);
  
  return {
    timestamp,
    signature,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    folder: env.CLOUDINARY_FOLDER,
    uploadPreset: env.CLOUDINARY_UPLOAD_PRESET
  };
}
