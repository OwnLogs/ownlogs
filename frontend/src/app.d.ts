// See https://svelte.dev/docs/kit/types#app.d.ts
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

      user?: {
        id: number;
        username: string;
        passwordHash: string;
      };

      token?: string;
    }
  }
}

export {};
