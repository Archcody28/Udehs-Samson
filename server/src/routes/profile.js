import express from 'express';
import Profile from '../models/Profile.js';
import upload, { uploadAvatar, ALLOWED_AVATAR_MIME } from '../middleware/upload.js';
import requireAdmin from '../middleware/requireAdmin.js';
import { AVATAR_UPLOAD, CV_UPLOAD } from '../services/cloudinaryUpload.js';
import { uploadProfileAsset } from '../services/profileUpload.js';

const router = express.Router();


// GET profile (public)
router.get('/', async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Allowed profile fields (prevent mass assignment)
const ALLOWED_PROFILE_FIELDS = [
  'name', 'title', 'tagline', 'bio', 'shortBio',
  'email', 'phone', 'location', 'website', 'github',
  'linkedin', 'x', 'whatsapp', 'facebook', 'avatar', 'cvUrl',
  'achievements', 'philosophy',
  'yearsOfExperience', 'clientSatisfaction', 'projectsDelivered', 'happyClients',
  'education', 'certifications',
];

// Validate profile updates
function validateProfileInput(sanitized) {
  const numericFields = ['yearsOfExperience', 'clientSatisfaction', 'projectsDelivered', 'happyClients'];
  for (const field of numericFields) {
    if (sanitized[field] !== undefined) {
      const num = Number(sanitized[field]);
      if (isNaN(num)) {
        return { error: `${field} must be a valid number` };
      }
      sanitized[field] = num;
    }
  }
  if (sanitized.education !== undefined && !Array.isArray(sanitized.education)) {
    return { error: 'education must be an array' };
  }
  if (sanitized.certifications !== undefined && !Array.isArray(sanitized.certifications)) {
    return { error: 'certifications must be an array' };
  }
  if (sanitized.achievements !== undefined && !Array.isArray(sanitized.achievements)) {
    return { error: 'achievements must be an array' };
  }
  if (sanitized.philosophy !== undefined && !Array.isArray(sanitized.philosophy)) {
    return { error: 'philosophy must be an array' };
  }
  if (sanitized.tagline !== undefined && typeof sanitized.tagline !== 'string') {
    return { error: 'tagline must be a string' };
  }
  if (sanitized.cvUrl !== undefined && typeof sanitized.cvUrl !== 'string') {
    return { error: 'cvUrl must be a string' };
  }
  // The avatar must originate from the authenticated upload route, so the
  // public profile payload can never carry an inline base64 image again.
  if (typeof sanitized.avatar === 'string' && sanitized.avatar.startsWith('data:')) {
    return { error: 'avatar must be an uploaded asset URL — use POST /api/profile/avatar' };
  }
  for (const field of ['facebook', 'linkedin', 'x']) {
    if (sanitized[field] !== undefined && typeof sanitized[field] !== 'string') {
      return { error: `${field} must be a string` };
    }
  }
  return null;
}

// PUT update profile (admin — content administration)
router.put('/', requireAdmin, async (req, res) => {
  try {
    const updates = req.body;
    // Whitelist allowed fields to prevent mass assignment
    const sanitized = {};
    for (const field of ALLOWED_PROFILE_FIELDS) {
      if (updates[field] !== undefined) {
        sanitized[field] = updates[field];
      }
    }
    // Validate input types
    const validationError = validateProfileInput(sanitized);
    if (validationError) {
      return res.status(400).json(validationError);
    }
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create(sanitized);
    } else {
      Object.assign(profile, sanitized);
      await profile.save();
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST upload CV (admin) — stores the resulting Cloudinary URL in Profile.cvUrl
router.post('/cv', requireAdmin, upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    const { secure_url } = await uploadProfileAsset(req.file.buffer, CV_UPLOAD);

    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({});
    }
    profile.cvUrl = secure_url;
    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error('CV upload error:', error);
    res.status(500).json({ error: 'Failed to upload CV' });
  }
});

// POST upload avatar (admin) — stores the resulting Cloudinary URL in
// Profile.avatar. This is the canonical write path for the avatar: the PUT
// route rejects data: URIs so the public payload can never carry base64 again.
router.post('/avatar', requireAdmin, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!ALLOWED_AVATAR_MIME.has(req.file.mimetype)) {
      return res.status(400).json({ error: 'Only JPEG, PNG or WebP images are allowed' });
    }

    let secureUrl;
    try {
      ({ secure_url: secureUrl } = await uploadProfileAsset(req.file.buffer, AVATAR_UPLOAD));
    } catch (uploadError) {
      // Cloudinary not configured (503) vs provider failure (502) — either way
      // the document is untouched because persistence happens below.
      const status = uploadError?.statusCode === 503 ? 503 : 502;
      return res.status(status).json({ error: uploadError?.message || 'Failed to upload avatar' });
    }

    // Never persist anything that is not a hosted HTTPS asset URL — this keeps
    // the profile document (and therefore /api/profile) free of inline base64.
    if (typeof secureUrl !== 'string' || !secureUrl.startsWith('https://')) {
      return res.status(502).json({ error: 'Upload did not return a hosted URL' });
    }

    // The document is only touched after a verified upload, so a failed upload
    // cannot corrupt the existing profile.
    const profile = await Profile.findOne();
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    profile.avatar = secureUrl;
    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Convert multer validation errors (e.g. wrong file type/size) to JSON responses
router.use((error, req, res, next) => {
  if (error) {
    return res.status(400).json({ error: error.message || 'Upload failed' });
  }
  next();
});

export default router;