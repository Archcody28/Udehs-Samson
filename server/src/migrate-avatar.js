import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import Profile from './models/Profile.js';
import { AVATAR_UPLOAD } from './services/cloudinaryUpload.js';
import { isProfileUploadConfigured, uploadProfileAsset } from './services/profileUpload.js';

dotenv.config();
dotenv.config({ path: new URL('../../.env', import.meta.url) });

// One-off avatar migration (F32a.11): the stored Profile.avatar is a
// `data:image/...;base64,...` URI (~222 kB). This decodes it, uploads it to
// Cloudinary under the canonical avatar public_id, and persists ONLY the
// returned HTTPS URL back to Profile.avatar. Idempotent: safe to rerun — a
// profile whose avatar is already an https:// URL is left untouched.
//
// Credentials: reads CLOUDINARY_* from the server env first, then falls back
// to the repo-root .env (used for local development).

function parseDataUri(avatar) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/.exec(avatar);
  if (!match) return null;
  return { mimeType: match[1], buffer: Buffer.from(match[2], 'base64') };
}

async function migrateAvatar() {
  if (!isProfileUploadConfigured()) {
    console.error('Cloudinary is not configured (CLOUDINARY_CLOUD_NAME/_API_KEY/_API_SECRET). Migration aborted.');
    process.exitCode = 1;
    return;
  }
  await connectDB(process.env.MONGODB_URI);
  const profile = await Profile.findOne();
  if (!profile) {
    console.error('No profile document found. Migration aborted.');
    process.exitCode = 1;
    return;
  }
  const avatar = profile.avatar ?? '';
  if (typeof avatar === 'string' && avatar.startsWith('https://')) {
    console.log('Avatar is already a hosted URL. Nothing to migrate.');
    return;
  }
  if (!avatar.startsWith('data:')) {
    console.error(`Unexpected avatar format (${avatar.slice(0, 32)}...). Refusing to touch unrelated fields.`);
    process.exitCode = 1;
    return;
  }
  const parsed = parseDataUri(avatar);
  if (!parsed || parsed.buffer.length === 0) {
    console.error('Avatar data: URI could not be decoded. Migration aborted.');
    process.exitCode = 1;
    return;
  }
  console.log(`Uploading avatar (${parsed.mimeType}, ${parsed.buffer.length} bytes) to Cloudinary...`);
  const { secure_url: secureUrl } = await uploadProfileAsset(parsed.buffer, AVATAR_UPLOAD);
  if (typeof secureUrl !== 'string' || !secureUrl.startsWith('https://')) {
    console.error('Upload did not return a hosted URL. Profile left untouched.');
    process.exitCode = 1;
    return;
  }
  profile.avatar = secureUrl;
  await profile.save();
  console.log(`Migrated avatar to hosted URL (${secureUrl.length} chars): ${secureUrl}`);
}

migrateAvatar().catch((error) => {
  console.error('Avatar migration failed:', error);
  process.exitCode = 1;
});
