/**
 * Migration: Fix session and admin credentials schema issues.
 *
 * 1. Remove obsolete `token_1` index from sessions collection.
 *    The Session model was migrated from `token` to `tokenHash`.
 *    MongoDB still has the old unique index `token_1` on the `token` field.
 *    New session documents don't have a `token` field, so MongoDB stores `null`,
 *    causing E11000 duplicate key errors when multiple sessions are created.
 *
 * 2. Update existing admin credentials documents to include username/email fields.
 *    The AdminCredentials model was updated to require username and email,
 *    but existing documents created before this change lack these fields.
 *
 * This script is safe to run multiple times.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // === Step 1: Fix sessions collection indexes ===
    console.log('\n--- Step 1: Fixing sessions collection ---');
    const sessionsCollection = db.collection('sessions');

    const indexes = await sessionsCollection.indexes();
    console.log('Current indexes on sessions:');
    for (const idx of indexes) {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    }

    // Check for obsolete token_1 index
    const obsoleteIndex = indexes.find(idx => idx.name === 'token_1');
    if (obsoleteIndex) {
      console.log('\nDropping obsolete index: token_1');
      await sessionsCollection.dropIndex('token_1');
      console.log('Successfully dropped token_1 index');
    } else {
      console.log('\nObsolete token_1 index not found - already clean');
    }

    // === Step 2: Fix admin credentials schema ===
    console.log('\n--- Step 2: Fixing admin credentials ---');
    const adminCollection = db.collection('admincredentials');

    // Find admin documents missing username or email
    const adminsNeedingUpdate = await adminCollection.find({
      $or: [
        { username: { $exists: false } },
        { email: { $exists: false } }
      ]
    }).toArray();

    if (adminsNeedingUpdate.length > 0) {
      console.log(`Found ${adminsNeedingUpdate.length} admin document(s) missing username/email`);

      for (const admin of adminsNeedingUpdate) {
        const update = {};
        if (!admin.username) update.username = 'admin';
        if (!admin.email) update.email = 'admin@example.com';

        await adminCollection.updateOne(
          { _id: admin._id },
          { $set: update }
        );
        console.log(`  Updated admin ${admin._id}:`, JSON.stringify(update));
      }
    } else {
      console.log('All admin documents have username and email fields');
    }

    console.log('\nMigration complete');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

migrate();
