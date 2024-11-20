import { env } from '$env/dynamic/public';

export const API_URL = `http://${env.PUBLIC_BACKEND_HOST}:${env.PUBLIC_BACKEND_PORT}/api`;
export const WEBSOCKET_URL = `ws://${env.PUBLIC_BACKEND_HOST}:${env.PUBLIC_BACKEND_PORT}/ws`;
