import { API_BASE_URL } from "./config.js";

const STORAGE_USER_KEY = 'moneyTrackUser';
const STORAGE_TOKEN_KEY = 'accessToken';

export const AuthService = {
    // --- Funções de API ---

    async register(name, email, password) {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
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

        if (response.ok) {
            const data = await response.json();
            
            AuthService.setToken(data.access_token);
            // CORREÇÃO: Salva os dados do usuário para uso no frontend (Dashboard, Perfil)
            if (data.user) { 
                AuthService.saveUserData(data.user);
            }
            
            return { success: true, data };
        }

        const data = await response.json();
        return { success: false, message: data.message || "Email ou senha inválidos." };
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
        // Salva apenas os dados essenciais para o frontend
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