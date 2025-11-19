import { API_BASE_URL } from "./config.js";
import { AuthService } from "./authService.js";
import { getCategories } from "./utils.js";

function getAuthHeaders() {
    const token = AuthService.getToken();
    if (!token) {
        // Redirecionamento pode ser necessário dependendo da arquitetura
        // window.location.href = '/login.html'; 
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

export const TransactionService = {
    // ------------------------------------
    // READ (GET /transactions/)
    // ------------------------------------
    async getTransactions() {
        const headers = getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/transactions/`, {
            method: 'GET',
            headers: headers
        });

        if (response.ok) {
            const transactions = await response.json();
            const categories = getCategories(); 
            
            // Cria um mapa para busca rápida de ícones
            const categoryMap = categories.reduce((map, c) => {
                map[c.name] = c.icon;
                return map;
            }, {});

            return transactions.map(t => {
                return {
                    ...t,
                    icon: categoryMap[t.category] || 'question-circle',
                    // Mapeamento de campos do Backend (Inglês) para o Frontend (Português)
                    descricao: t.description, 
                    valor: t.amount,
                    categoria: t.category
                };
            });
        }
        throw new Error('Erro ao carregar transações.');
    },

    // ------------------------------------
    // CREATE (POST /transactions/)
    // ------------------------------------
    async addTransaction(newTransaction) {
        const headers = getAuthHeaders();
        
        const payload = {
            description: newTransaction.descricao,
            amount: parseFloat(newTransaction.valor),
            category: newTransaction.categoria,
            type: newTransaction.tipo,
            date: newTransaction.data + "T00:00:00" 
        };

        const response = await fetch(`${API_BASE_URL}/transactions/`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (response.status === 201) {
            return await response.json();
        }
        throw new Error('Erro ao adicionar transação.');
    },

    // ------------------------------------
    // UPDATE (PUT /transactions/{id})
    // ------------------------------------
    async updateTransaction(id, updatedTransaction) {
        const headers = getAuthHeaders();
        
        const payload = {
            description: updatedTransaction.descricao,
            amount: parseFloat(updatedTransaction.valor),
            category: updatedTransaction.categoria,
            type: updatedTransaction.tipo,
            date: updatedTransaction.data ? updatedTransaction.data + "T00:00:00" : undefined 
        };

        const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            return await response.json();
        }
        throw new Error('Erro ao atualizar transação.');
    },

    // ------------------------------------
    // DELETE (DELETE /transactions/{id})
    // ------------------------------------
    async deleteTransaction(id) {
        const headers = getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
            method: 'DELETE',
            headers: headers
        });
        
        if (response.status === 204) { 
            return { success: true };
        }
        throw new Error('Erro ao deletar transação.');
    }
};