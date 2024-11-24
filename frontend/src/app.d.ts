// See https://svelte.dev/docs/kit/types#app.d.ts

import type { User } from '$lib/server/db/user';

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
    interface Locals {
      // Add your custom properties here

      user?: User;

      token?: string;

      hasARegisteredUser?: boolean;
    }
  }
}

export {};
