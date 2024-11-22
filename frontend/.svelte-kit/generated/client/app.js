export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12')
];

export const server_loads = [0,2];

export const dictionary = {
		"/(home)": [3],
		"/app": [~6,[2]],
		"/app/account/settings": [~7,[2]],
		"/app/log-out": [~8,[2]],
		"/app/logs": [9,[2]],
		"/app/logs/details": [10,[2]],
		"/app/servers": [~11,[2]],
		"/app/servers/[id]": [~12,[2]],
		"/(home)/log-in": [~4],
		"/(home)/register": [~5]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),

	reroute: (() => {})
};

export { default as root } from '../root.js';