import createPool from "../core/db_connection";
import mysql from 'mysql2/promise';
import crypto from 'crypto';


interface ExternalUserConfig {
  db_host: string;
  db_port: string;
  db_name: string;
  db_user: string;
  db_password: string;
  user_table: string;
}

export class ExternalUserModel {
  private pool: mysql.Pool;

  constructor(private providerConfig: ExternalUserConfig) {
    console.log(providerConfig)
    this.pool = mysql.createPool({
      host: this.providerConfig.db_host,
      port: parseInt(this.providerConfig.db_port),
      user: this.providerConfig.db_user,
      password: this.providerConfig.db_password,
      database: this.providerConfig.db_name,
      waitForConnections: true,
      connectionLimit: 10
    });
  }

  async getUserById(externalId: string, idColumn: string): Promise<any> {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT * FROM ${this.providerConfig.user_table} WHERE ${idColumn} = ?`,
        [externalId]
      );
      return (rows as any[])[0] || null;
    } finally {
      connection.release();
    }
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async getUserByCredential(
    fieldMapping: { emailField: string, passwordField: string },
    credentials: { email: string, password: string }
  ): Promise<any> {
    const connection = await this.pool.getConnection();
    try {
      // First get user by email only
      const [userRows] = await connection.query(
        `SELECT * FROM ${this.providerConfig.user_table} 
         WHERE ${fieldMapping.emailField} = ?`,
        [credentials.email]
      );

      if (!userRows || (userRows as any).length === 0) {
        return null;
      }

      const user = (userRows as any)[0];
      
      // Compare hashed passwords
      const inputHash = this.hashPassword(credentials.password);
      if (user[fieldMapping.passwordField] !== inputHash) {
        return null;
      }

      return user;
    } finally {
      connection.release();
    }
  }

  async closePool() {
    await this.pool.end();
  }
}