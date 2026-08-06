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
  // We apply transformations. For Cloudinary, we can use their transformation API.
  // First, extract the face and resize to 1080x1080.
  // Then overlay the frame image (which we'll assume is uploaded with public_id "hh-goa-frame" in the root).
  
  // Note: For Cloudinary, the frame overlay must exist in your Cloudinary account. 
  // Let's assume the user uploaded the frame with public ID "hh-goa-frame".
  // const overlayId = 'hh-goa-frame'; // Adjust this if the frame has a different public_id in cloudinary

  const transformations = [
    { width: 1080, height: 1080, crop: 'thumb', gravity: 'face' },
    // Temporarily disabled since 'hh-goa-frame' does not exist in your Cloudinary account
    // { overlay: overlayId, width: 1080, height: 1080, crop: 'scale' },
  ];

  // We only need the cropped face image now, since the text and layout are rendered via HTML/CSS on the frontend.

  return cloudinary.url(publicId, {
    transformation: transformations
  });
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
