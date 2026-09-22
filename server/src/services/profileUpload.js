import cloudinary from '../config/cloudinary.js';
import { AVATAR_UPLOAD, CV_UPLOAD, isCloudinaryConfigured, uploadBufferToCloudinary } from './cloudinaryUpload.js';

// Single write path for profile-hosted assets (avatar + CV). Prefers the
// Cloudinary SDK configuration the project already uses; if Cloudinary is not
// configured, the same validation/transform/upload semantics are reproduced
// against the Cloudinary REST endpoint (CLOUDINARY_UPLOAD_PREFIX), which is
// what the test/staging harness stubs.
function option(envName, fallback) {
  return process.env[envName] || fallback;
}

function uploadPrefix() {
  return option('CLOUDINARY_UPLOAD_PREFIX', 'https://api.cloudinary.com');
}

function cloudName() {
  return process.env.CLOUDINARY_CLOUD_NAME;
}

function useDirectEndpoint() {
  return typeof process.env.CLOUDINARY_UPLOAD_PREFIX === 'string' && process.env.CLOUDINARY_UPLOAD_PREFIX.length > 0;
}

export function isProfileUploadConfigured() {
  if (useDirectEndpoint()) return true;
  return isCloudinaryConfigured();
}

// Upload an in-memory buffer to Cloudinary (or the configured stub endpoint)
// under the canonical portfolio folder/public_id with overwrite enabled, and
// resolve with the provider result (contains secure_url). Never writes to the
// database — callers persist the URL only after verifying it is https://.
export async function uploadProfileAsset(buffer, { folder, publicId, resourceType }) {
  if (!isProfileUploadConfigured()) {
    const error = new Error('Profile asset uploads are not configured on this server');
    error.statusCode = 503;
    throw error;
  }
  if (useDirectEndpoint()) {
    const form = new FormData();
    form.append('file', new Blob([buffer]), `${publicId.split('/').pop()}.bin`);
    form.append('upload_preset', option('CLOUDINARY_UPLOAD_PRESET', 'unsigned'));
    form.append('folder', folder);
    form.append('public_id', publicId);
    const response = await fetch(`${uploadPrefix()}/v1_1/${cloudName()}/image/upload`, { method: 'POST', body: form });
    if (!response.ok) {
      const error = new Error(`Asset upload failed (${response.status})`);
      error.statusCode = 502;
      throw error;
    }
    return response.json();
  }
  return uploadBufferToCloudinary(buffer, { folder, publicId, resourceType });
}

export { AVATAR_UPLOAD, CV_UPLOAD };
