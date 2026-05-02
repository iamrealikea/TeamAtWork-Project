const db = require('../config/db')
const { AVATAR_DIR } = require('../config/multer')

exports.getById = async (id) => {
  const result = await db.query(
    `SELECT id, username, email, firstname, lastname, avatar_hash, avatar_ext 
      FROM users 
      WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

/* Authentication */
exports.getByEmail = async (email) => {
  const result = await db.query(
    `SELECT id, username, email, firstname, lastname, password_hash, avatar_hash, avatar_ext
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email]
  );
  return result.rows[0];
}

exports.createUser = async ({ firstname, lastname, username, email, passwordHash }) => {
  const result = await db.query(
    `INSERT INTO users ( firstname, lastname, username, email, password_hash)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, username, email, firstname, lastname, avatar_hash, avatar_ext`,
    [firstname, lastname, username, email, passwordHash]
  );

  return result.rows[0];
}

exports.getAll = async () => {
  const result = await db.query(
    `SELECT id, username, email, firstname, lastname, avatar_hash, avatar_ext
     FROM users
     ORDER BY id ASC`
  );
  return result.rows;
}

/* Account management */
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
