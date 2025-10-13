const env = import.meta.env;

export const IS_PRODUCTION = env.VITE_APP_PRODUCTION === 'true';
export const BACKEND_URL: string = env.VITE_APP_BE_URL;
