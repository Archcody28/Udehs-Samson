import cloudinary from '../config/cloudinary.js';

// Cloudinary is optional locally; treat missing/placeholder credentials as
// "not configured" so callers can fail with a clear error instead of an opaque
// provider failure, and a misconfigured deploy can never persist a bad asset
// URL.
export function isCloudinaryConfigured() {
  const {
    CLOUDINARY_CLOUD_NAME: cloud,
    CLOUDINARY_API_KEY: key,
    CLOUDINARY_API_SECRET: secret,
  } = process.env;
  const usable = (value) => typeof value === 'string' && value.length > 0 && !value.startsWith('your-');
  return usable(cloud) && usable(key) && usable(secret);
}

// Upload an in-memory buffer to Cloudinary and resolve with the upload result.
// Shared by the profile route handlers and the one-off avatar migration script
// so the Cloudinary call shape lives in exactly one place.
export function uploadBufferToCloudinary(buffer, { folder, publicId, resourceType }) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: resourceType,
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// Both the CV and the avatar are stored under a stable public_id with
// overwrite enabled, so only the hosted asset URL ever lives in MongoDB.
export const CV_UPLOAD = { folder: 'portfolio/cv', publicId: 'portfolio/cv/cv', resourceType: 'auto' };
export const AVATAR_UPLOAD = {
  folder: 'portfolio/avatar',
  publicId: 'portfolio/avatar/avatar',
  resourceType: 'image',
};
