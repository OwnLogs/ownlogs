import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import {
  usernameIsTaken,
  updateUsername,
  updatePassword,
  createNewUser
} from '$lib/server/db/user';
import { generateAccessToken } from '$lib/server/auth';
import bcrypt from 'bcryptjs';

export const actions: Actions = {
  async updateUsername({ request, cookies, locals }) {
    const formData = Object.fromEntries(await request.formData());
    const { username } = formData as { username: string };

    if (!locals.user) {
      return fail(401, {
        error: true,
        message: 'You must be logged in to update your username!',
        action: 'updateUsername'
      });
    }

    if (!username) {
      return fail(400, {
        error: true,
        message: 'Please enter a username!',
        action: 'updateUsername'
      });
    }

    // Validate username (only letters and numbers)
    if (!/^[a-zA-Z0-9]+$/.test(username))
      return fail(400, {
        error: true,
        message: 'Username can only contain letters and numbers!',
        action: 'updateUsername'
      });

    // Validate username (at least 3 characters long)
    if (username.length < 3)
      return fail(400, {
        error: true,
        message: 'Username must be at least 3 characters long!',
        action: 'updateUsername'
      });

    // Validate username (at most 20 characters long)
    if (username.length > 20)
      return fail(400, {
        error: true,
        message: 'Username must be at most 20 characters long!',
        action: 'updateUsername'
      });

    try {
      const usernameIsAlreadyUsed = await usernameIsTaken(username);

      // If username is taken, return error
      if (usernameIsAlreadyUsed)
        return fail(400, {
          error: true,
          message: 'This username is already taken!',
          action: 'updateUsername'
        });

      await updateUsername(locals.user.id, username);
      cookies.set('token', generateAccessToken(username), {
        path: '/',
        maxAge: 60 * 60 * 24,
        secure: false
      });

      locals.user.username = username;
      return { success: true, message: 'Username updated!', username, action: 'updateUsername' };
    } catch (error) {
      console.error(error);
      return fail(400, { error: true, message: 'An error occurred!' });
    }
  },
  async updatePassword({ request, locals }) {
    const formData = Object.fromEntries(await request.formData());
    const { currentPassword, newPassword } = formData as {
      currentPassword: string;
      newPassword: string;
    };

    if (!locals.user) {
      return fail(401, {
        error: true,
        message: 'You must be logged in to update your password!',
        action: 'updatePassword'
      });
    }

    if (!currentPassword || !newPassword) {
      return fail(400, {
        error: true,
        message: 'Please fill in all fields!',
        action: 'updatePassword'
      });
    }

    // Validate new password (at least 6 characters long)
    if (newPassword.length < 6)
      return fail(400, {
        error: true,
        message: 'New password must be at least 6 characters long!',
        action: 'updatePassword'
      });

    try {
      const compare = bcrypt.compareSync(currentPassword, locals.user.passwordHash);

      // If password is incorrect, return error
      if (!compare)
        return fail(400, { error: true, message: 'Incorrect password!', action: 'updatePassword' });

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);

      await updatePassword(locals.user.id, hash);

      locals.user.passwordHash = hash;

      return { success: true, message: 'Password updated!', action: 'updatePassword' };
    } catch (error) {
      console.error(error);
      return fail(400, { error: true, message: 'An error occurred!', action: 'updatePassword' });
    }
  },
  async createGuestAccount({ request }) {
    const formData = Object.fromEntries(await request.formData());
    const { username, password } = formData as {
      username: string;
      password: string;
    };

    // Check if username is already used
    const usernameIsAlreadyUsed = await usernameIsTaken(username);

    if (usernameIsAlreadyUsed) return fail(400, { error: true, message: 'Username is taken!' });

    // Validate username (only letters and numbers)
    if (!/^[a-zA-Z0-9]+$/.test(username))
      return fail(400, {
        error: true,
        message: 'Username can only contain letters and numbers!',
        action: 'createGuestAccount'
      });

    // Validate username (at least 3 characters long)
    if (username.length < 3)
      return fail(400, {
        error: true,
        message: 'Username must be at least 3 characters long!',
        action: 'createGuestAccount'
      });

    // Validate username (at most 20 characters long)
    if (username.length > 20)
      return fail(400, {
        error: true,
        message: 'Username must be at most 20 characters long!',
        action: 'createGuestAccount'
      });

    // Validate password (at least 6 characters long)
    if (password.length < 6)
      return fail(400, {
        error: true,
        message: 'Password must be at least 6 characters long!',
        action: 'createGuestAccount'
      });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Create user
    await createNewUser(username, hash);

    return {
      success: true,
      message: 'User created successfully!',
      action: 'createGuestAccount'
    };
  }
};
