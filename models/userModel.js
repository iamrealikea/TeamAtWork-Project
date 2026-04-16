const db = require('../config/db')
const { AVATAR_DIR } = require('../config/multer')

exports.getById = async (id) => {
  const result = await db.query(
    `SELECT id, username, email, firstname, lastname, avatar_hash, avatar_ext FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

exports.updateAccount = async (id, updates) => {
  const allowedFields = ['username', 'email', 'firstname', 'lastname']
  const entries = Object.entries(updates || {}).filter(([key, value]) => (
    allowedFields.includes(key) && value !== undefined
  ))

  if (entries.length === 0) {
    return null
  }

  const setClause = entries
    .map(([key], index) => `${key} = $${index + 1}`)
    .join(', ')
  const values = entries.map(([, value]) => value)
  values.push(id)

  const result = await db.query(
    `UPDATE users SET ${setClause} WHERE id = $${entries.length + 1} returning id, username, email, firstname, lastname`,
    values
  )
  return result.rows[0]
}

/*Avatar update*/
exports.getAvatar = async (id) => {
  const result = await db.query(
    `SELECT avatar_hash, avatar_ext FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

exports.updateAvatar = async (id, hash, ext) => {
  const result = await db.query(
    `UPDATE users 
    SET avatar_hash = $1, avatar_ext = $2 WHERE id = $3`,
    [hash, ext, id]
  );
  return result.rows[0];
}
