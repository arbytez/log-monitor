const { randomBytes } = require('crypto');
const bcrypt = require('bcryptjs');

const signale = require('./logger');

const pass = randomBytes(4).toString('hex');
const passHash = bcrypt.hashSync(pass, 10);

process.env.JWT_SECRET = randomBytes(100).toString('hex');

signale.note(
  `------------------------- application password: '${pass}' -------------------------`
);

module.exports = passHash;
