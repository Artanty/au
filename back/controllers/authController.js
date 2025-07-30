const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const createPool = require('../core/db_connection');
const axios = require('axios');

dotenv.config();

/** 
 * login, register move to user@ - done, checked.
 * todo: move logout, refresh-token
 * */

class AuthController {
  static arr = [] // todo  mb add source if login?

  static async register({ username, email, password }) {
    const payload = { username, email, password };
    try {
      const response = await axios.post(
        `${process.env.USER_BACK_URL}/api/users/register`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 5000
        }
      );
      return response.data;

    } catch (error) {
      throw new Error(error.message);
    }
  }
  
  static async login({ email, password }) {
    const payload = { email, password }

    try {
      const response = await axios.post(
        `${process.env.USER_BACK_URL}/api/users/login`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 5000
        }
      );
      return response.data;

    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Logout
  static async logout({ refreshToken }) {
    // const pool = createPool();
    // const connection = await pool.getConnection();
  
    // try {
    //   // Delete the refresh token from the database
    //   await connection.query('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);

    //   connection.release();
    //   return { message: 'Logged out successfully' };
    // } catch (error) {
    //   connection.release();
    //   throw new Error(error.message);
    // } 
  }

  // Refresh Token
  static async refreshToken({ refreshToken }) {
    // const pool = createPool();
    // const connection = await pool.getConnection();

    // try {
    //   // Verify the refresh token
    //   const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    //   // Check if the refresh token exists in the database
    //   const [tokens] = await connection.query('SELECT * FROM refresh_tokens WHERE token = ?', [refreshToken]);
    //   if (tokens.length === 0) {
    //     throw new Error('Invalid refresh token');
    //   }

    //   // Generate a new access token
    //   const accessToken = this.generateToken(decoded.id);

    //   connection.release();
    //   return { accessToken };
    // } catch (error) {
    //   connection.release();
    //   throw new Error(error.message);
    // }
  }

  // // Helper function to generate tokens
  // static generateToken(userId) {
  //   return jwt.sign(
  //     { id: userId }, 
  //     process.env.JWT_SECRET, 
  //     { expiresIn: process.env.JWT_EXPIRES_IN }
  //   );
  // }

  // static generateRefreshToken(userId) {
  //   return jwt.sign(
  //     { id: userId }, 
  //     process.env.JWT_SECRET, 
  //     { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  //   );
  // }
}

module.exports = AuthController;