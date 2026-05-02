/*File uploading handler.*/
const multer = require('multer');
const path = require('path');
const hashUtil = require('../utils/hash');

const AVATAR_DIR = path.join(__dirname, '../uploads/profiles');
const FILE_DIR = path.join(__dirname, '../uploads/teams');

const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, AVATAR_DIR);
    },
    filename: (req, file, cb) => {
      const hash = hashUtil.hashFileName(file.originalname, req.params.id);
      const ext = path.extname(file.originalname).toLowerCase();

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
      const hash = hashUtil.hashFileName(file.originalname, req.params.aId);
      const ext = path.extname(file.originalname).toLowerCase();

        // Attach to request for later use in controller
        req.fileOriginal = file.originalname;
        req.fileHash = hash;
        req.fileExt = ext;

        // File saved in hash+ext
        cb(null, `${hash}${ext}`);
    }
})

const avatarUpload = multer({ storage: avatarStorage, fileFilter: avatarFilter, limits: { fileSize: 5 * 512 * 512 } })
const fileUpload = multer({ storage: fileStorage, limits: { fileSize: 10 * 1024 * 1024 } }) // 10MB limit

module.exports = {
  avatarUpload,
  fileUpload,
  AVATAR_DIR,
  FILE_DIR
}