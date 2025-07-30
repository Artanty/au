import createPool from "../core/db_connection";

export interface IUser {
	id?: number;
	username: string;
	email: string;
	password_hash: string;
	created_at?: Date;
}

export class UserModel {
	static pool = createPool();

	static async create(user: Omit<IUser, 'id'>): Promise<any> {
		const connection = await UserModel.pool.getConnection();
		const [result] = await connection.execute(
			'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
			[user.username, user.email, user.password_hash]
		);
		// return UserModel.getById((result as any).insertId);
		return (result as any).insertId;
	}

	static async getById(id: number): Promise<IUser | null> {
		const connection = await UserModel.pool.getConnection();
		const [rows] = await connection.execute(
			'SELECT * FROM users WHERE id = ?',
			[id]
		);
		return (rows as IUser[])[0] || null;
	}

	static async getByEmail(email: string): Promise<IUser | null> {
		const connection = await UserModel.pool.getConnection();
		const [rows] = await connection.execute(
			'SELECT * FROM users WHERE email = ?',
			[email]
		);
		return (rows as IUser[])[0] || null;
	}

	static async logout(refreshToken: string) {
		const connection = await UserModel.pool.getConnection();
	  
		try {
			await connection.query('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);

			connection.release();
			return { message: 'Logged out successfully' };
		} catch (error: any) {
			connection.release();
			throw new Error(error.message);
		} 
	}
}
