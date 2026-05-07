/*File uploading handler.*/
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const hashUtil = require('../utils/hash');

const AVATAR_DIR = path.join(__dirname, '../uploads/profiles');
const FILE_DIR = path.join(__dirname, '../uploads/teams');

// Ensure upload directories exist before multer writes files
[AVATAR_DIR, FILE_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const normalizeFileName = (name = '') => {
  const buf = Buffer.from(name, 'latin1');
  return buf.toString('utf8');
};

const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, AVATAR_DIR);
    },
    filename: (req, file, cb) => {
      const originalName = normalizeFileName(file.originalname);
      const hash = hashUtil.hashFileName(originalName, req.params.id);
      const ext = path.extname(originalName).toLowerCase();

        // Attach to request for later use in controller
        req.fileHash = hash;
        req.fileExt = ext;

        // File saved in hash+ext
        cb(null, `${hash}${ext}`);
    }
})

const avatarFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF files are allowed.'), false)
  }
}

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, FILE_DIR);
        
    },
    filename: (req, file, cb) => {
      const originalName = normalizeFileName(file.originalname);
      const hash = hashUtil.hashFileName(originalName, req.params.aId);
      const ext = path.extname(originalName).toLowerCase();
      const originalBase = path.parse(originalName).name;

        // Attach to request for later use in controller
        req.fileUpload = req.fileUpload
          ? [...req.fileUpload, { hash, originalName: originalBase, ext }]
          : [{ hash, originalName: originalBase, ext }];

        // File saved in hash+ext
        cb(null, `${hash}${ext}`);
        console.log(req.fileUpload);
    }
    
})

const avatarUpload = multer({ storage: avatarStorage, fileFilter: avatarFilter, limits: { fileSize: 5 * 512 * 512 } })
const fileUpload = multer({ storage: fileStorage, limits: { fileSize: 100 * 1024 * 1024 } }) // 10MB limit

module.exports = {
  avatarUpload,
  fileUpload,
  AVATAR_DIR,
  FILE_DIR
}