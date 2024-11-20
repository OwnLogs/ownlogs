import { writable } from 'svelte/store';

import type { Writable } from 'svelte/store';

export const pageMetadata: Writable<{
  title: string;
  description: string;
  breadcrumbs: { name: string; url?: string }[];
}> = writable({
  title: '',
  description: '',
  breadcrumbs: []
});
