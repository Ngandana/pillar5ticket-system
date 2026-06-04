/**
 * middleware/upload.js
 * Multer configuration for ticket image attachments.
 */
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename:    (_req, file, cb) => {
    const ts     = Date.now();
    const rand   = Math.round(Math.random() * 1e6);
    const ext    = path.extname(file.originalname).toLowerCase();
    cb(null, `${ts}-${rand}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const valid   = allowed.test(path.extname(file.originalname).toLowerCase())
               && allowed.test(file.mimetype);
  cb(valid ? null : new Error('Only image files (jpg, png, gif, webp) are allowed.'), valid);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB cap
});

module.exports = upload;
