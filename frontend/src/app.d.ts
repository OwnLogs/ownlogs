// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export interface Log {
	id: number;
	level: LogLevel;
	message: string;
	timestamp: string;
};

export {};
