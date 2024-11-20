import db from './index.js';
import { type ResultSetHeader, type RowDataPacket } from 'mysql2';

export interface User {
  id: number;
  username: string;
  passwordHash: string;
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
  const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM user WHERE username = ?', [
    username
  ]);
  if (rows.length === 0) return null;
  return rows[0] as User;
}

export async function usernameIsTaken(username: string) {
  const user = await findUserByUsername(username);
  if (user === null) return false;
  return user.username === username;
}
