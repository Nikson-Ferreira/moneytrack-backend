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
        console.log('[TRANSACTION-SERVICE] Buscando transações...');
        const headers = getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/transactions/`, {
            method: 'GET',
            headers: headers
        });

        console.log('[TRANSACTION-SERVICE] Status da resposta:', response.status);

        if (response.ok) {
            const transactions = await response.json();
            console.log('[TRANSACTION-SERVICE] Transações recebidas:', transactions.length);
            
            if (transactions.length > 0) {
                console.log('[TRANSACTION-SERVICE] Exemplo de transação (antes do mapeamento):', transactions[0]);
            }
            
            const categories = getCategories(); 
            
            // Cria um mapa para busca rápida de ícones
            const categoryMap = categories.reduce((map, c) => {
                map[c.name] = c.icon;
                return map;
            }, {});

            const mapped = transactions.map(t => {
                return {
                    ...t,
                    icon: categoryMap[t.category] || 'question-circle',
                    // Mapeamento de campos do Backend (Inglês) para o Frontend (Português)
                    descricao: t.description, 
                    valor: t.amount,
                    categoria: t.category,
                    tipo: t.type === 'income' ? 'receita' : 'despesa',
                    data: t.date
                };
            });
            
            if (mapped.length > 0) {
                console.log('[TRANSACTION-SERVICE] Exemplo de transação (depois do mapeamento):', mapped[0]);
            }
            
            return mapped;
        }
        
        const errorData = await response.json().catch(() => ({}));
        console.error('[TRANSACTION-SERVICE] Erro ao buscar transações:', errorData);
        throw new Error(errorData.detail || 'Erro ao carregar transações.');
    },

    // ------------------------------------
    // CREATE (POST /transactions/)
    // ------------------------------------
    async addTransaction(newTransaction) {
        const headers = getAuthHeaders();
        
        console.log('[TRANSACTION-SERVICE] Adicionando transação:', newTransaction);
        
        const payload = {
            description: newTransaction.descricao,
            amount: parseFloat(newTransaction.valor),
            category: newTransaction.categoria,
            type: newTransaction.tipo === 'receita' ? 'income' : 'expense',
            date: newTransaction.data + "T00:00:00" 
        };

        console.log('[TRANSACTION-SERVICE] Payload enviado:', payload);

        const response = await fetch(`${API_BASE_URL}/transactions/`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        console.log('[TRANSACTION-SERVICE] Status da resposta:', response.status);

        if (response.status === 201 || response.status === 200) {
            const result = await response.json();
            console.log('[TRANSACTION-SERVICE] Transação criada:', result);
            return result;
        }
        
        const errorData = await response.json().catch(() => ({}));
        console.error('[TRANSACTION-SERVICE] Erro ao criar transação:', errorData);
        throw new Error(errorData.detail || 'Erro ao adicionar transação.');
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
            type: updatedTransaction.tipo === 'receita' ? 'income' : 'expense',
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
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Erro ao atualizar transação.');
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
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Erro ao deletar transação.');
    }
};