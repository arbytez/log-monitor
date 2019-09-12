const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const passwordHash = require('../password');

const Mutation = {
  async login(parent, args, ctx, info) {
    const { password } = args;
    if (!password) throw new Error('password is a required field');
    // Check if password is correct
    const valid = await bcrypt.compare(password, passwordHash);
    if (!valid) {
      throw new Error('Invalid Password!');
    }
    // generate the JWT Token
    const token = jwt.sign({ logged: true }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });
    // Set the cookie with the token
    ctx.res.cookie('token', token, {
      // httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week cookie
    });
    return true;
  },
  async logout(parent, args, ctx, info) {
    ctx.res.clearCookie('token');
    return true;
  }
};

module.exports = Mutation;
