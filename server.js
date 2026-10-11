const path = require('path');
const fs = require('fs');
require('dotenv').config();

if (!process.env.DB_PASSWORD && fs.existsSync(path.join(__dirname, '.env.production'))) {
  require('dotenv').config({ path: path.join(__dirname, '.env.production') });
}

const express = require('express');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const db = require('./db');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

const ASSETS_DIR = path.join(__dirname, 'public', 'assets');
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// In-memory active session tokens
const activeSessions = new Set();

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());

// Multer storage for uploads: Saves directly into public/assets folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ASSETS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    cb(null, `${base}_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }
});

function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

// Authentication middleware
function requireAuth(req, res, next) {
  const token = req.cookies.admin_session || req.headers['authorization']?.replace('Bearer ', '');
  if (token && activeSessions.has(token)) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized. Please log in.' });
}

// Database status check endpoint
app.get('/api/db-status', async (req, res) => {
  const status = await db.testConnection();
  res.json({
    ...status,
    config: {
      type: db.config.DB_TYPE,
      host: db.config.DB_HOST,
      port: db.config.DB_PORT,
      user: db.config.DB_USER,
      database: db.config.DB_NAME
    }
  });
});

// Public API: Get portfolio data from SQL database
app.get('/api/portfolio', async (req, res) => {
  try {
    const data = await db.getPortfolioData();
    res.json(data);
  } catch (err) {
    res.status(503).json({
      error: 'Database connection failed: ' + err.message,
      hint: 'Please ensure your MySQL credentials in .env are correct and database/setup.sql has been executed.'
    });
  }
});

// Auth API: Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const envUsername = process.env.ADMIN_USERNAME || 'admin';
  const envPassword = process.env.ADMIN_PASSWORD || 'admin123';

  // 1. Direct match with .env credentials
  if (username === envUsername && password === envPassword) {
    const token = crypto.randomBytes(32).toString('hex');
    activeSessions.add(token);

    res.cookie('admin_session', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Sync to MySQL in background
    try {
      const salt = 'kz_portfolio_salt_2026';
      const hash = hashPassword(envPassword, salt);
      await db.syncAdminUser(envUsername, hash, salt);
    } catch (e) {
      // ignore
    }

    return res.json({ success: true, message: 'Logged in successfully', token });
  }

  // 2. Check against database admin_users table
  try {
    const user = await db.getAuthUser(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const hash = hashPassword(password, user.salt);
    if (hash === user.passwordHash) {
      const token = crypto.randomBytes(32).toString('hex');
      activeSessions.add(token);

      res.cookie('admin_session', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({ success: true, message: 'Logged in successfully', token });
    }

    return res.status(401).json({ error: 'Invalid username or password.' });
  } catch (err) {
    return res.status(500).json({
      error: 'Authentication failed: ' + err.message,
      hint: 'Ensure database is connected and admin_users table exists.'
    });
  }
});

// Auth API: Status
app.get('/api/auth/status', (req, res) => {
  const token = req.cookies.admin_session || req.headers['authorization']?.replace('Bearer ', '');
  if (token && activeSessions.has(token)) {
    return res.json({ authenticated: true });
  }
  res.json({ authenticated: false });
});

// Auth API: Logout
app.post('/api/auth/logout', (req, res) => {
  const token = req.cookies.admin_session || req.headers['authorization']?.replace('Bearer ', '');
  if (token) activeSessions.delete(token);
  res.clearCookie('admin_session');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Auth API: Change password or username in SQL database
app.post('/api/auth/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newUsername, newPassword } = req.body;

  try {
    const user = await db.getAuthUser(newUsername || 'admin');
    if (!user) {
      return res.status(400).json({ error: 'User not found in database.' });
    }

    const currentHash = hashPassword(currentPassword, user.salt);
    if (currentHash !== user.passwordHash) {
      return res.status(400).json({ error: 'Current password does not match.' });
    }

    let finalSalt = user.salt;
    let finalHash = user.passwordHash;

    if (newPassword && newPassword.length >= 6) {
      finalSalt = crypto.randomBytes(16).toString('hex');
      finalHash = hashPassword(newPassword, finalSalt);
    }

    await db.updateAuthUser(user.username, newUsername, finalHash, finalSalt);
    res.json({ success: true, message: 'Admin credentials updated in database.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update credentials: ' + err.message });
  }
});

// Protected API: Update portfolio data in SQL database
app.put('/api/portfolio', requireAuth, async (req, res) => {
  const updatedData = req.body;
  if (!updatedData || typeof updatedData !== 'object') {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  try {
    await db.savePortfolioData(updatedData);
    res.json({ success: true, message: 'Portfolio updated in SQL database successfully', data: updatedData });
  } catch (err) {
    res.status(500).json({ error: 'Database update failed: ' + err.message });
  }
});

// Protected API: Reset to default resume data from SQL setup
app.post('/api/portfolio/reset', requireAuth, async (req, res) => {
  try {
    await db.resetDatabaseToDefault();
    const freshData = await db.getPortfolioData();
    res.json({ success: true, message: 'Portfolio reset to default resume data in database', data: freshData });
  } catch (err) {
    res.status(500).json({ error: 'Reset failed: ' + err.message });
  }
});

// Protected API: File upload directly into assets folder
app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/assets/${req.file.filename}`;
  res.json({ success: true, url: fileUrl, filename: req.file.filename });
});

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper: Scan public/assets and compare against active database records
async function getAssetsAnalysis() {
  const data = await db.getPortfolioData();
  const allFiles = fs.readdirSync(ASSETS_DIR).filter(f => !f.startsWith('.'));

  const used = new Set();
  function scan(val) {
    if (!val) return;
    if (typeof val === 'string') {
      const match = val.match(/\/assets\/([^"?#]+)/);
      if (match) used.add(match[1]);
      else if (allFiles.includes(val)) used.add(val);
    } else if (Array.isArray(val)) {
      val.forEach(scan);
    } else if (typeof val === 'object') {
      Object.values(val).forEach(scan);
    }
  }
  scan(data);

  // System core template assets that must never be deleted (static site chrome)
  const systemProtected = new Set([
    'favicon.svg', 'banner-pattern.svg', 'hero-visual.gif', 'hero-visual.svg'
  ]);
  systemProtected.forEach(f => used.add(f));

  const imageExts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.ico']);
  
  const unusedMedia = [];
  const unusedPdfs = [];
  const usedAssets = [];

  let totalBytes = 0;
  let unusedMediaBytes = 0;
  let unusedPdfBytes = 0;

  for (const filename of allFiles) {
    const fullPath = path.join(ASSETS_DIR, filename);
    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch {
      continue;
    }
    if (!stat.isFile()) continue;

    const size = stat.size;
    totalBytes += size;
    const ext = path.extname(filename).toLowerCase();
    const item = {
      filename,
      ext,
      size,
      sizeFormatted: formatBytes(size),
      url: `/assets/${filename}`,
      modified: stat.mtime,
      isImage: imageExts.has(ext),
      isGif: ext === '.gif',
      isPdf: ext === '.pdf'
    };

    if (used.has(filename)) {
      usedAssets.push(item);
    } else if (ext === '.pdf') {
      unusedPdfs.push(item);
      unusedPdfBytes += size;
    } else if (imageExts.has(ext)) {
      unusedMedia.push(item);
      unusedMediaBytes += size;
    }
  }

  const unusedTotalCount = unusedMedia.length + unusedPdfs.length;
  const unusedTotalBytes = unusedMediaBytes + unusedPdfBytes;
  const unusedTotalFormatted = formatBytes(unusedTotalBytes);

  return {
    totalFiles: allFiles.length,
    totalBytes,
    totalFormatted: formatBytes(totalBytes),
    totalSizeFormatted: formatBytes(totalBytes),
    usedCount: usedAssets.length,
    unusedMediaCount: unusedMedia.length,
    unusedMediaBytes,
    unusedMediaFormatted: formatBytes(unusedMediaBytes),
    unusedMediaSizeFormatted: formatBytes(unusedMediaBytes),
    unusedMedia,
    unusedPdfCount: unusedPdfs.length,
    unusedPdfBytes,
    unusedPdfFormatted: formatBytes(unusedPdfBytes),
    unusedPdfSizeFormatted: formatBytes(unusedPdfBytes),
    unusedPdfs,
    unusedTotalCount,
    unusedTotalBytes,
    unusedTotalFormatted,
    unusedTotalSizeFormatted: unusedTotalFormatted,
    usedAssets: usedAssets.map(u => u.filename)
  };
}

// Protected API: Analyze asset storage vs database references
app.get('/api/assets/analysis', requireAuth, async (req, res) => {
  try {
    const analysis = await getAssetsAnalysis();
    res.json({ success: true, analysis, ...analysis });
  } catch (err) {
    res.status(500).json({ error: 'Asset analysis failed: ' + err.message });
  }
});

// Protected API: Delete unused media or PDFs
app.post('/api/assets/delete-unused', requireAuth, async (req, res) => {
  try {
    const { type, filename } = req.body;
    const analysis = await getAssetsAnalysis();

    let filesToDelete = [];
    if (type === 'media') {
      filesToDelete = analysis.unusedMedia;
    } else if (type === 'pdf') {
      filesToDelete = analysis.unusedPdfs;
    } else if (type === 'all') {
      filesToDelete = [...analysis.unusedMedia, ...analysis.unusedPdfs];
    } else if (type === 'single' && filename) {
      const safe = path.basename(filename);
      const match = [...analysis.unusedMedia, ...analysis.unusedPdfs].find(f => f.filename === safe);
      if (!match) {
        return res.status(400).json({ error: `File "${safe}" is either in use by database or does not exist.` });
      }
      filesToDelete = [match];
    } else {
      return res.status(400).json({ error: 'Invalid deletion type. Use media, pdf, all, or single.' });
    }

    if (!filesToDelete.length) {
      return res.json({ success: true, message: 'No unused files found to delete.', deletedCount: 0, freedBytes: 0, freedFormatted: '0 B' });
    }

    let deletedCount = 0;
    let freedBytes = 0;
    const deletedFiles = [];

    for (const item of filesToDelete) {
      const safeName = path.basename(item.filename);
      // Double check it is not in used assets
      if (analysis.usedAssets.includes(safeName)) {
        continue;
      }
      const fullPath = path.join(ASSETS_DIR, safeName);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        deletedCount++;
        freedBytes += item.size;
        deletedFiles.push(safeName);
      }
    }

    res.json({
      success: true,
      message: `Deleted ${deletedCount} unused file(s) and freed ${formatBytes(freedBytes)}.`,
      deletedCount,
      deletedFiles,
      freedBytes,
      freedFormatted: formatBytes(freedBytes)
    });
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed: ' + err.message });
  }
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Admin portal routes
app.get(/^\/admin(\/.*)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

// Fallback to portfolio index
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, async () => {
  const envAdminUser = process.env.ADMIN_USERNAME || 'admin';
  const envAdminPass = process.env.ADMIN_PASSWORD || 'admin123';

  console.log(`=======================================================`);
  console.log(`🚀 Portfolio Live: http://localhost:${PORT}`);
  console.log(`🛡️ Admin Portal:  http://localhost:${PORT}/admin (Private URL)`);
  console.log(`🔑 Admin User:    ${envAdminUser} (From .env)`);
  console.log(`🗄️ SQL Database:  ${db.config.DB_NAME} on ${db.config.DB_HOST}:${db.config.DB_PORT}`);

  const connStatus = await db.testConnection();
  if (connStatus.ok) {
    console.log(`✅ ${connStatus.message}`);
    // Sync admin credentials from .env to database
    try {
      const salt = 'kz_portfolio_salt_2026';
      const hash = hashPassword(envAdminPass, salt);
      await db.syncAdminUser(envAdminUser, hash, salt);
    } catch (e) {
      // ignore
    }
  } else {
    console.log(`⚠️ Database connection pending: ${connStatus.error}`);
    console.log(`ℹ️ To complete setup:`);
    console.log(`   1. Set your DB credentials in .env (DB_USER, DB_PASSWORD, etc.)`);
    console.log(`   2. Run database/setup.sql in your MySQL database`);
  }
  console.log(`=======================================================`);
});
