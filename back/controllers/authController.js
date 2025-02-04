const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const createPool = require('../core/db_connection');

dotenv.config();

class AuthController {
  // Helper function to generate tokens
  static generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  static generateRefreshToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  // Signup
  static async signup({ username, email, password }) {
    const pool = createPool();
    const connection = await pool.getConnection();

    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert the user into the database
      const [result] = await connection.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword]
      );

      connection.release();
      return { message: 'User created successfully', userId: result.insertId };
    } catch (error) {
      connection.release();
      throw new Error(error.message);
    }
  }

  // Login
  static async login({ email, password }) {
    const pool = createPool();
    const connection = await pool.getConnection();

    try {
      // Find the user by email
      const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = users[0];

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate tokens
      const accessToken = this.generateToken(user.id);
      const refreshToken = this.generateRefreshToken(user.id);

      // Save the refresh token in the database
      await connection.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
        [user.id, refreshToken]
      );

      connection.release();
      return { accessToken, refreshToken };
    } catch (error) {
      connection.release();
      throw new Error(error.message);
    }
  }

  // Logout
  static async logout({ refreshToken }) {
    const pool = createPool();
    const connection = await pool.getConnection();

    try {
      // Delete the refresh token from the database
      await connection.query('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);

      connection.release();
      return { message: 'Logged out successfully' };
    } catch (error) {
      connection.release();
      throw new Error(error.message);
    }
  }

  // Refresh Token
  static async refreshToken({ refreshToken }) {
    const pool = createPool();
    const connection = await pool.getConnection();

    try {
      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

      // Check if the refresh token exists in the database
      const [tokens] = await connection.query('SELECT * FROM refresh_tokens WHERE token = ?', [refreshToken]);
      if (tokens.length === 0) {
        throw new Error('Invalid refresh token');
      }

      // Generate a new access token
      const accessToken = this.generateToken(decoded.id);

      connection.release();
      return { accessToken };
    } catch (error) {
      connection.release();
      throw new Error(error.message);
    }
  }
}

module.exports = AuthController;