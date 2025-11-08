import { BACKEND_URL } from '@/envs';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const instance = axios.create({
    baseURL: BACKEND_URL,
});

instance.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
        const { exp } = jwtDecode(accessToken ?? '');
        const currentTime = Date.now() / 1000;
        const isExpired = !exp || exp < currentTime;
        if (isExpired) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user-store');
        } else {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
    }
    return config;
});

export default instance;
