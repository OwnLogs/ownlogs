import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { generateAccessToken } from '$lib/server/auth';
import { fail } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import { usernameIsTaken, createNewUser } from '$lib/server/db/user';

export const actions: Actions = {
  async register({ cookies, request }) {
    const formData = Object.fromEntries(await request.formData());
    const { username, password } = formData as {
      username: string;
      password: string;
    };

    // Check if username is already used
    const usernameIsAlreadyUsed = await usernameIsTaken(username);

    if (usernameIsAlreadyUsed) return fail(400, { error: 'Username is taken!' });

    // Validate username (only letters and numbers)
    if (!/^[a-zA-Z0-9]+$/.test(username))
      return fail(400, {
        error: 'Username can only contain letters and numbers!'
      });

    // Validate username (at least 3 characters long)
    if (username.length < 3)
      return fail(400, {
        error: 'Username must be at least 3 characters long!'
      });

    // Validate username (at most 20 characters long)
    if (username.length > 20)
      return fail(400, {
        error: 'Username must be at most 20 characters long!'
      });

    // Validate password (at least 6 characters long)
    if (password.length < 6)
      return fail(400, {
        error: 'Password must be at least 6 characters long!'
      });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Create user
    await createNewUser(username, hash);

    // Set token
    cookies.set('token', generateAccessToken(username), {
      path: '/',
      maxAge: 60 * 60 * 24,
      secure: false
    });

    throw redirect(303, '/app');
  }
};
