import mongoose from 'mongoose';

/**
 * Middleware to validate that a route parameter is a valid MongoDB ObjectId.
 * Usage: router.get('/:id', validateObjectId('id'), handler)
 */
export function validateObjectId(paramName) {
  return (req, res, next) => {
    const value = req.params[paramName];
    if (!value || !mongoose.isValidObjectId(value)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    next();
  };
}