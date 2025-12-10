import axios from 'axios';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

// Request interceptor: Inject JWT token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 Unauthorized with automatic token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry && typeof window !== 'undefined') {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    // Attempt to refresh the access token
                    const response = await axios.post('http://localhost:3001/auth/refresh', {
                        refresh_token: refreshToken
                    });

                    const { access_token } = response.data;

                    // Store new access token
                    localStorage.setItem('token', access_token);

                    // Update the authorization header
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;

                    // Retry the original request
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh failed, clear tokens and redirect to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/auth/login';
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token, redirect to login
                localStorage.removeItem('token');
                window.location.href = '/auth/login';
            }
        }

        return Promise.reject(error);
    }
);
