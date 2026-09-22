import http from 'http';
import { once } from 'events';

// Local verification harness for F32a.11 (NOT part of the production app).
// Spins up:
//  1. a stub Cloudinary upload endpoint that records the multipart body and
//     replies with a hosted secure_url, and
//  2. the real Express app (server/src/index.js exports are reused via a
//     child process) pointed at a scratch Mongo database.
// Verifies:
//  - POST /api/profile/avatar (admin) persists ONLY the hosted URL
//  - PUT /api/profile rejects data: avatars (400)
//  - PUT /api/profile accepts normal fields
//  - GET /api/profile is small and avatar is https://
// Usage: node scripts/verify-avatar-migration.mjs  (from server/)
const SCRATCH_DB = 'mongodb://localhost:27017/udeh_avatar_verify';
const API_PORT = 5199;
const STUB_PORT = 5299;
const FAKE_URL = 'https://res.cloudinary.com/demo/image/upload/v1/portfolio/avatar/avatar.jpg';

const seen = { bytes: 0, contentType: '' };

const stub = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/v1_1/demo/image/upload') {
    seen.contentType = req.headers['content-type'] || '';
    req.on('data', (c) => { seen.bytes += c.length; });
    req.on('end', () => {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ secure_url: FAKE_URL, public_id: 'portfolio/avatar/avatar' }));
    });
    return;
  }
  res.writeHead(404); res.end();
});
stub.listen(STUB_PORT);
await once(stub, 'listening');

process.env.MONGODB_URI = SCRATCH_DB;
process.env.PORT = String(API_PORT);
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.CLOUDINARY_CLOUD_NAME = 'demo';
process.env.CLOUDINARY_UPLOAD_PREFIX = `http://localhost:${STUB_PORT}`;

const [{ default: mongoose }, { connectDB }] = await Promise.all([
  import('mongoose'),
  import('../src/config/db.js'),
]);
await connectDB(SCRATCH_DB);
await mongoose.connection.db.dropDatabase();
const { default: Profile } = await import('../src/models/Profile.js');
const { default: Session } = await import('../src/models/Session.js');
await Profile.create({
  name: 'Verify User', title: 'T', tagline: 'tag', bio: 'bio', shortBio: 'short',
  email: 'v@example.com', phone: '1', location: 'L', website: 'https://example.com',
  github: 'https://github.com/x', whatsapp: 'https://wa.me/1',
  avatar: 'data:image/jpeg;base64,' + Buffer.from('tiny-bytes').toString('base64'),
});
const rawToken = 'verify-token-123';
await Session.create({ tokenHash: Session.hashToken(rawToken), expiresAt: new Date(Date.now() + 3600e3) });

const { spawn } = await import('child_process');
const child = spawn(process.execPath, ['src/index.js'], { env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
let started = false;
await new Promise((resolve, reject) => {
  const to = setTimeout(() => reject(new Error('server did not start: ' + out)), 15000);
  let out = '';
  child.stdout.on('data', (c) => { out += c; if (out.includes('Server running')) { started = true; clearTimeout(to); resolve(); } });
  child.stderr.on('data', (c) => { out += c; });
});
if (!started) { child.kill(); stub.close(); process.exit(1); }

const base = `http://localhost:${API_PORT}`;
const auth = { Authorization: `Bearer ${rawToken}` };
let failures = 0;
function check(name, cond, extra = '') {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' -- ' + extra : ''}`);
  if (!cond) failures += 1;
}
try {
  // 1. PUT rejects data: avatar
  let r = await fetch(`${base}/api/profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ avatar: 'data:image/png;base64,AAAA' }) });
  check('PUT rejects data: avatar with 400', r.status === 400, `status=${r.status}`);

  // 2. PUT accepts a normal field edit
  r = await fetch(`${base}/api/profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Verify City' }) });
  const putBody = await r.json();
  check('PUT accepts normal fields', r.status === 200 && putBody.location === 'Verify City', `status=${r.status}`);

  // 3. Unauthenticated avatar upload is rejected
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
  let form = new FormData();
  form.append('avatar', new Blob([jpeg], { type: 'image/jpeg' }), 'a.jpg');
  r = await fetch(`${base}/api/profile/avatar`, { method: 'POST', body: form });
  check('POST /avatar without token is 401', r.status === 401, `status=${r.status}`);

  // 4. Authenticated avatar upload persists hosted URL
  form = new FormData();
  form.append('avatar', new Blob([jpeg], { type: 'image/jpeg' }), 'a.jpg');
  r = await fetch(`${base}/api/profile/avatar`, { method: 'POST', headers: auth, body: form });
  const up = await r.json();
  check('POST /avatar returns hosted URL', r.status === 200 && up.avatar === FAKE_URL, `status=${r.status} avatar=${String(up.avatar).slice(0, 60)}`);
  check('stub received multipart upload', seen.bytes > 0 && seen.contentType.includes('multipart/form-data'), `bytes=${seen.bytes}`);

  // 5. DB holds only the URL
  const doc = await Profile.findOne().lean();
  check('DB avatar is hosted URL only', doc.avatar === FAKE_URL, `len=${doc.avatar.length}`);

  // 6. GET /api/profile is small
  r = await fetch(`${base}/api/profile`);
  const raw = await r.text();
  check('GET /api/profile small with https avatar', r.status === 200 && raw.length < 5000 && raw.includes(FAKE_URL) && !raw.includes('data:image'), `bytes=${raw.length}`);
  console.log(`GET /api/profile bytes=${raw.length} (baseline was 223980)`);
} finally {
  child.kill();
  stub.close();
  await mongoose.disconnect();
}
process.exit(failures ? 1 : 0);
