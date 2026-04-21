const User = require('../../models/userModel');
const path = require('path');
const fs = require('fs');
const { AVATAR_DIR } = require('../../config/multer');

// GET /users
exports.getAllUsers = async (req, res) => {
  const users = await User.getAll();
  res.json(users);
}

// GET /users/:id
exports.getMe = async (req, res) => {
  const user = await User.getById(req.params.id)
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }
  res.json(user)
}

// POST /users/:id
exports.updateMe = async (req, res) => {
  const user = await User.updateAccount(req.params.id, req.body)
  if (user === null) {
    return res.status(400).json({ message: 'No valid fields to update' })
  }
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }
  res.json(user)
}

exports.updateAvatar = async (req, res) => {
  const { id } = req.params
  if (!req.file) {
    return res.status(400).json({ message: 'Invalid image file' })
  }
  try {
    const oldAvatar = await User.getAvatar(id)
    //Check exist image and delete if exist
    if (!oldAvatar) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: 'User not found' });
    }
    if (oldAvatar.avatar_hash){
      const oldPath = path.join(AVATAR_DIR, `${oldAvatar.avatar_hash}${oldAvatar.avatar_ext}`);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    //Save new avatar
    const user = await User.updateAvatar(id, req.fileHash, req.fileExt);
    res.json({message: 'Avatar updated successfully', user});
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}  