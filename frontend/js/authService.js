import { API_BASE_URL } from "./config.js";

const STORAGE_USER_KEY = 'moneyTrackUser';
const STORAGE_TOKEN_KEY = 'accessToken';

export const AuthService = {
    // --- Funções de API ---

    async registerUser(userData) {
        console.log('[REGISTER] Enviando requisição de cadastro:', userData);
        console.log('[REGISTER] URL:', `${API_BASE_URL}/auth/register`);
        
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData) 
    });

        console.log('[REGISTER] Status da resposta:', response.status);
        const data = await response.json();
        console.log('[REGISTER] Dados da resposta:', data);
        
        return { success: response.ok, data, status: response.status };
    },

    async login(email, password) {
        console.log('[LOGIN] Tentando fazer login com email:', email);
        console.log('[LOGIN] URL:', `${API_BASE_URL}/auth/login`);
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        console.log('[LOGIN] Status da resposta:', response.status);
        const data = await response.json();
        console.log('[LOGIN] Dados da resposta:', data);

        if (response.ok) {
            console.log('[LOGIN] Login bem-sucedido! Salvando token e dados do usuário...');
            AuthService.setToken(data.access_token);
            if (data.user) { 
                AuthService.saveUserData(data.user);
                console.log('[LOGIN] Dados do usuário salvos:', data.user);
            }
            return { success: true, data };
        }

        console.log('[LOGIN] ERRO: Falha no login');
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