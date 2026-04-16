/*Hash maker*/
const { randomBytes, createHmac } = require('node:crypto');

const hashFileName = (originalName, userId) => {
    const uniqueString = `${originalName}-${userId}-${Date.now()}-${randomBytes(16).toString('hex')}`;

    return createHmac('sha256', process.env.HASH_SECRET)
        .update(uniqueString)
        .digest('hex');
};

module.exports = { hashFileName };