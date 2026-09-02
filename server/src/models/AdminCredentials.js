import mongoose from 'mongoose';

/**
 * TEMPORARY model for emergency admin password provisioning.
 * Stores a single bcrypt hash for the admin password in MongoDB.
 * This allows password changes without modifying environment variables.
 * REMOVE THIS MODEL once the setup endpoint is permanently disabled.
 */
const adminCredentialsSchema = new mongoose.Schema({
  passwordHash: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('AdminCredentials', adminCredentialsSchema);
