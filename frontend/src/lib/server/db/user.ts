import db from './';
import { type ResultSetHeader, type RowDataPacket } from 'mysql2';

export interface User {
  id: number;
  username: string;
  passwordHash: string;
}

export async function hasAUserRegistered(): Promise<boolean> {
  const [rows] = await db.execute<RowDataPacket[]>('SELECT COUNT(*) count FROM user');
  return rows.length > 0 && rows[0].count > 0;
}

export async function createNewUser(
  username: string,
  passwordHash: string
): Promise<ResultSetHeader> {
  const [rows] = await db.execute('INSERT INTO user (username, passwordHash) VALUES (?, ?)', [
    username,
    passwordHash
  ]);
  return rows as ResultSetHeader;
}

export async function findUserByUsername(username: string): Promise<User | null> {
  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM user WHERE BINARY username = ?',
      [username]
    );
    if (rows.length === 0) return null;
    return rows[0] as User;
  } catch (error) {
    console.error('Error finding user by username:', error);
    return null;
  }
}

export async function usernameIsTaken(username: string): Promise<boolean> {
  const user = await findUserByUsername(username);
  if (user === null) return false;
  return user.username === username;
}

export async function updateUsername(id: number, username: string): Promise<ResultSetHeader> {
  const [rows] = await db.execute('UPDATE user SET username = ? WHERE id = ?', [username, id]);
  return rows as ResultSetHeader;
}

export async function updatePassword(id: number, passwordHash: string): Promise<ResultSetHeader> {
  const [rows] = await db.execute('UPDATE user SET passwordHash = ? WHERE id = ?', [
    passwordHash,
    id
  ]);
  return rows as ResultSetHeader;
}
