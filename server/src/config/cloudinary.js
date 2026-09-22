import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  // Optional override of the Cloudinary API host. Defaults to the SDK's own
  // https://api.cloudinary.com; set this to point at a stub/staging endpoint
  // when verifying the upload pipeline without production credentials.
  upload_prefix: process.env.CLOUDINARY_UPLOAD_PREFIX,
});

export default cloudinary;
