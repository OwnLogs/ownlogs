import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
  usernameIsTaken,
  updatePassword,
  createNewUser,
  getAllUsers,
  deleteUser,
  updateUser,
  type User
} from '$lib/server/db/user';
import { generateAccessToken } from '$lib/server/auth';
import bcrypt from 'bcryptjs';
import { isEmailValid } from '$lib/utils';

export const load = (async () => {
  const allUsers = await getAllUsers();

  return {
    allUsers
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  async updateUsername({ request, cookies, locals }) {
    const formData = Object.fromEntries(await request.formData());
    const { username, email } = formData as { username: string; email: string };

    if (!locals.user) {
      return fail(401, {
        error: true,
        message: 'You must be logged in to update your username!',
        action: 'updateUsername'
      });
    }

    // Validate email
    if (!isEmailValid(email))
      return fail(400, {
        error: true,
        message: 'Please provide a valid email address!',
        action: 'updateUsername'
      });

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

      await updateUser(locals.user.id, { username, email, role: locals.user.role } as { username: string; email: string; role: User['role'] });
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
    const { username, email, password, role } = formData as {
      username: string;
      email: string;
      password: string;
      role: string;
    };

    // Check if username is already used
    const usernameIsAlreadyUsed = await usernameIsTaken(username);

    if (usernameIsAlreadyUsed) return fail(400, { error: true, message: 'Username is taken!' });

    // Validate email
    if (!isEmailValid(email))
      return fail(400, {
        error: true,
        message: 'Please provide a valid email address!',
        action: 'createGuestAccount'
      });

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

    // Validate role
    if (!role)
      return fail(400, {
        error: true,
        message: 'Please select a role!',
        action: 'createGuestAccount'
      });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Create user
    const { insertId } = await createNewUser(username, email, hash, role);

    const newUser = {
      username,
      role,
      email,
      id: insertId
    };

    return {
      success: true,
      message: 'User created successfully!',
      action: 'createGuestAccount',
      newUser
    };
  },
  async deleteUserAccount({ request, locals }) {
    const formData = Object.fromEntries(await request.formData());
    const userId = parseInt(formData?.userId as string);

    if (!locals.user) {
      return fail(401, {
        error: true,
        message: 'You must be logged in to delete a user!',
        action: 'deleteUserAccount'
      });
    }

    if (!userId) {
      return fail(400, {
        error: true,
        message: 'Please provide a user ID!',
        action: 'deleteUserAccount'
      });
    }

    if (locals.user.id === userId) {
      return fail(400, {
        error: true,
        message: 'You cannot delete your own account!',
        action: 'deleteUserAccount'
      });
    }

    try {
      // Delete user
      await deleteUser(userId);

      return {
        success: true,
        message: 'User deleted successfully!',
        action: 'deleteUserAccount'
      };
    } catch (error) {
      console.error(error);
      return fail(400, { error: true, message: 'An error occurred!', action: 'deleteUserAccount' });
    }
  },
  async editUserAccount({ request, locals }) {
    const formData = Object.fromEntries(await request.formData());

    const { userId, username, email, role } = formData as {
      userId: string;
      email: string;
      username: string;
      role: string;
    };

    if (!locals.user) {
      return fail(401, {
        error: true,
        message: 'You must be logged in to edit a user!',
        action: 'editUserAccount'
      });
    }

    if (!isEmailValid(email)) {
      return fail(400, {
        error: true,
        message: 'Please provide a valid email address!',
        action: 'editUserAccount'
      });
    }

    if (!userId) {
      return fail(400, {
        error: true,
        message: 'Please provide a user ID!',
        action: 'editUserAccount'
      });
    }

    if (!username) {
      return fail(400, {
        error: true,
        message: 'Please provide a username!',
        action: 'editUserAccount'
      });
    }

    if (!role) {
      return fail(400, {
        error: true,
        message: 'Please provide a role!',
        action: 'editUserAccount'
      });
    }

    // Edit user
    try {
      await updateUser(parseInt(userId), { username, role, email } as {
        username: string;
        role: User['role'];
        email: string;
      });

      return {
        success: true,
        message: 'User edited successfully!',
        action: 'editUserAccount',
        updatedUser: {
          id: parseInt(userId),
          username,
          role
        }
      };
    } catch (error) {
      console.error(error);
      return fail(400, {
        error: true,
        message: error as string,
        action: 'editUserAccount'
      });
    }
  }
};
