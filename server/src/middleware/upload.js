import multer from 'multer';

// Store file in memory for direct upload to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF only
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

// Profile avatar uploads: images only, with a much smaller cap than the CV
// (the React admin compresses to <=400px before sending, so 5MB is generous).
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024; // 5MB max
export const ALLOWED_AVATAR_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: AVATAR_MAX_BYTES,
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_AVATAR_MIME.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG or WebP images are allowed'), false);
    }
  },
});

export default upload;

