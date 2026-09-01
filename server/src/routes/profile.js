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