import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import { findUserByUsername, type User } from './db/user';

/**
 * Authenticates a user based on the provided JWT token.
 */
async function auth(token: string): Promise<User | null> {
  return new Promise((resolve, reject) => {
    if (!token) reject({ error: 'No token was provided!' });
    jwt.verify(token, JWT_SECRET, async (err, decoded: unknown) => {
      if (err) return reject({ error: err });
      const user = await findUserByUsername(decoded as string);
      resolve(user);
    });
  });
}

function generateAccessToken(username: string): string {
  return jwt.sign(username, JWT_SECRET);
}

export { auth, generateAccessToken };
