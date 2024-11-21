import DB from '.';

export interface User {
  id: number;
  username: string;
  passwordHash: string;
}

class UserDAO {
  async findUserByUsername(username: string): Promise<User | null> {
    if (!username) {
      return null;
    }
    try {
      const sql = `
        SELECT *
        FROM user
        WHERE username = ?
      `;
      const rows = await DB.query(sql, [username]);
      if (rows.length === 0) {
        return null;
      }
      return rows[0] as User;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  }

  async createUser(username: string, passwordHash: string): Promise<User> {
    const sql = `
      INSERT INTO user (username, passwordHash)
      VALUES (?, ?)
    `;
    const params = [username, passwordHash];
    const insertId = await DB.execute(sql, params);
    const user: User = { username, passwordHash, id: insertId };
    return user;
  }

  async updateUser(user: User): Promise<User> {
    const sql = `
      UPDATE user
      SET username = ?, passwordHash = ?
      WHERE id = ?
    `;
    const params = [user.username, user.passwordHash, user.id];
    await DB.execute(sql, params);
    return user;
  }
}

export default new UserDAO();
