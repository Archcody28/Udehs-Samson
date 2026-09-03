import express from 'express';
import Profile from '../models/Profile.js';

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
  'linkedin', 'x', 'whatsapp', 'avatar', 'cvUrl',
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

export default router;