import express from 'express';
import BlogPost from '../models/BlogPost.js';
import { validateObjectId } from '../middleware/validate.js';

const router = express.Router();

// GET all blog posts (public)
router.get('/', async (req, res) => {
  try {
    const blogs = await BlogPost.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// POST create blog post (public)
router.post('/', async (req, res) => {
  try {
    const blog = await BlogPost.create(req.body);
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// PUT update blog post (public)
router.put('/:id', validateObjectId('id'), async (req, res) => {
  try {
    const blog = await BlogPost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

// DELETE blog post (public)
router.delete('/:id', validateObjectId('id'), async (req, res) => {
  try {
    const blog = await BlogPost.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.json({ message: 'Blog post deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

export default router;