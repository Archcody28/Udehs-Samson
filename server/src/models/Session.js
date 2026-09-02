import mongoose from 'mongoose';
import crypto from 'crypto';

const sessionSchema = new mongoose.Schema({
  tokenHash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// TTL index: MongoDB automatically deletes sessions when expiresAt passes
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to hash a token
sessionSchema.statics.hashToken = function (token) {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export default mongoose.model('Session', sessionSchema);
