import express from 'express';
import Message from '../models/Message.js';
import { validateObjectId } from '../middleware/validate.js';
import requireAdmin from '../middleware/requireAdmin.js';

const router = express.Router();

// Boundary: POST is the public contact form; everything else (listing,
// read-state updates, deletion) is admin-only message administration.

// GET all messages (admin — message administration; deferred data load)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST create message (public - contact form submission)
router.post('/', async (req, res) => {
  try {
    const message = await Message.create(req.body);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// PUT update message (admin — read-state marking)
router.put('/:id', requireAdmin, validateObjectId('id'), async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// DELETE message (admin)
router.delete('/:id', requireAdmin, validateObjectId('id'), async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;