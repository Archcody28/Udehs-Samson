import express from 'express';
import Profile from '../models/Profile.js';
import cloudinary from '../config/cloudinary.js';
import upload from '../middleware/upload.js';

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
  'achievement', 'philosophy',
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
  if (sanitized.tagline !== undefined && typeof sanitized.tagline !== 'string') {
    return { error: 'tagline must be a string' };
  }
  if (sanitized.cvUrl !== undefined && typeof sanitized.cvUrl !== 'string') {
    return { error: 'cvUrl must be a string' };
  }
  for (const field of ['achievement', 'philosophy', 'facebook', 'linkedin', 'x']) {
    if (sanitized[field] !== undefined && typeof sanitized[field] !== 'string') {
      return { error: `${field} must be a string` };
    }
  }
  return null;
}

// PUT update profile (public)
router.put('/', async (req, res) => {
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

// Helper: upload PDF buffer to Cloudinary (returns secure URL)
function uploadPdfToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'portfolio/cv',
        public_id: 'portfolio/cv/cv',
        resource_type: 'auto',
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

// POST upload CV (admin) — stores the resulting Cloudinary URL in Profile.cvUrl
router.post('/cv', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    const { secure_url } = await uploadPdfToCloudinary(req.file.buffer);

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

// Convert multer validation errors (e.g. wrong file type/size) to JSON responses
router.use((error, req, res, next) => {
  if (error) {
    return res.status(400).json({ error: error.message || 'Upload failed' });
  }
  next();
});

export default router;