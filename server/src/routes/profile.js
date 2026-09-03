import express from 'express';
import Profile from '../models/Profile.js';
import { requireAdmin } from '../middleware/auth.js';

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
];

// PUT update profile (admin only)
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
    console.log('[PUT /api/profile] Sanitized fields:', Object.keys(sanitized));
    let profile = await Profile.findOne();
    if (!profile) {
      console.log('[PUT /api/profile] No existing profile, creating new one');
      profile = await Profile.create(sanitized);
    } else {
      console.log('[PUT /api/profile] Updating existing profile:', profile.id);
      Object.assign(profile, sanitized);
      await profile.save();
    }
    console.log('[PUT /api/profile] Success, returning profile');
    res.json(profile);
  } catch (error) {
    console.error('[PUT /api/profile] Error:', error.message);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;