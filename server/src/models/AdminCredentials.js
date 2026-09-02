import mongoose from 'mongoose';

/**
 * Permanent admin authentication model.
 * Stores the single admin account credentials in MongoDB.
 * Only one admin document should exist in this collection.
 */
const adminCredentialsSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('AdminCredentials', adminCredentialsSchema);
