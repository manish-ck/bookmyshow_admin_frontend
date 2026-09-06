export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/admin';

export const API_ENDPOINTS = {
    dashboard: {
        movies: `${API_BASE_URL}/movie`,
        theatres: `${API_BASE_URL}/theatre`,
        screens: `${API_BASE_URL}/screen`,
        shows: `${API_BASE_URL}/shows`,
        users: `${API_BASE_URL}/user`,
        bookings: `${API_BASE_URL}/booking`,
        transactions: `${API_BASE_URL}/transaction`,
    },
    movies: `${API_BASE_URL}/movie`,
    theatres: `${API_BASE_URL}/theatre`,
    screens: `${API_BASE_URL}/screen`,
    seats: `${API_BASE_URL}/seat`,
    shows: `${API_BASE_URL}/shows`,
    users: `${API_BASE_URL}/user`,
    bookings: `${API_BASE_URL}/booking`,
    transactions: `${API_BASE_URL}/transaction`,
};
