import { z } from 'zod';

export const formSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().max(255),
  publicUrl: z.string().max(255)
});

export type FormSchema = typeof formSchema;
