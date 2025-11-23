import { API_BASE_URL } from "./config.js";

const STORAGE_USER_KEY = 'moneyTrackUser';
const STORAGE_TOKEN_KEY = 'accessToken';

export const AuthService = {
    // --- Funções de API ---

    async registerUser(name, email, password) { // RENOMEADO para registerUser
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // A função fetch enviará o JSON com as chaves name, email, password
        body: JSON.stringify(userData) 
    });

        const data = await response.json();
        return { success: response.ok, data, status: response.status };
    },

    async login(email, password) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            AuthService.setToken(data.access_token);
            if (data.user) { 
                AuthService.saveUserData(data.user);
            }
            return { success: true, data };
        }

        // Retorna o status e a mensagem de erro da API em caso de falha
        return { success: false, data, status: response.status, message: data.message || "Email ou senha inválidos." };
    },
    
    logout() {
        AuthService.removeToken();
        AuthService.removeUserData(); 
    },

    setToken(token) {
        localStorage.setItem(STORAGE_TOKEN_KEY, token);
    },
    
    getToken() {
        return localStorage.getItem(STORAGE_TOKEN_KEY);
    },
    
    removeToken() {
        localStorage.removeItem(STORAGE_TOKEN_KEY);
    },

    saveUserData(user) {
        const { id, name, email, photoURL } = user;
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify({ id, name, email, photoURL }));
    },

    loadUserData() {
        const storedUser = localStorage.getItem(STORAGE_USER_KEY);
        if (storedUser) {
            try {
                return JSON.parse(storedUser);
            } catch (e) {
                return null;
            }
        }
        return null;
    },
    
    removeUserData() {
        localStorage.removeItem(STORAGE_USER_KEY);
    }
};