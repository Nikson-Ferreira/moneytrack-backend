// =========================================================
// js/utils.js - Funções de Utilidade, Cálculo e Categorias
// =========================================================

const STORAGE_CATEGORIES_KEY = 'moneyTrackCategories';

export function getDefaultCategories() {
    return [
        { name: 'Salário', type: 'receita', icon: 'currency-dollar' },
        { name: 'Investimento', type: 'receita', icon: 'graph-up' },
        { name: 'Renda Extra', type: 'receita', icon: 'cash-stack' },

        { name: 'Moradia', type: 'despesa', icon: 'house-door' },
        { name: 'Contas Residenciais', type: 'despesa', icon: 'receipt' },
        { name: 'Transporte', type: 'despesa', icon: 'bus-front' },
        { name: 'Saúde', type: 'despesa', icon: 'heart-pulse' },
        { name: 'Mercado', type: 'despesa', icon: 'cart' },
        { name: 'Educação', type: 'despesa', icon: 'book' },
        { name: 'Cuidados Pessoais', type: 'despesa', icon: 'bag-heart' },
        { name: 'Entretenimento', type: 'despesa', icon: 'joystick' },
        { name: 'Compras / Serviços', type: 'despesa', icon: 'tags' },
        { name: 'Lazer', type: 'despesa', icon: 'balloon' },
        { name: 'Outros', type: 'despesa', icon: 'three-dots' }
    ];
}

export function saveCategories(categories) {
    localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
}

export function getCategories() {
    console.log('[GET-CATEGORIES] Buscando categorias do localStorage...');
    const categoriesJson = localStorage.getItem(STORAGE_CATEGORIES_KEY);
    const defaults = getDefaultCategories();
    
    console.log('[GET-CATEGORIES] Categorias padrão:', defaults.length);

    if (!categoriesJson) {
        console.log('[GET-CATEGORIES] Nenhuma categoria salva, usando padrões');
        saveCategories(defaults);
        return defaults;
    }

    let categories = JSON.parse(categoriesJson);
    console.log('[GET-CATEGORIES] Categorias carregadas do localStorage:', categories.length);

    // Garante que as categorias salvas tenham ícones, usando defaults como fallback
    categories = categories.map(cat => {
        const def = defaults.find(d => d.name === cat.name);
        return {
            ...cat,
            icon: cat.icon || (def ? def.icon : 'question-circle')
        };
    });

    saveCategories(categories);
    console.log('[GET-CATEGORIES] Retornando', categories.length, 'categorias');
    return categories;
}

export function addCategory(newCategory) {
    const categories = getCategories();
    if (categories.some(c => c.name.toLowerCase() === newCategory.name.toLowerCase())) {
        return false;
    }
    newCategory.icon = newCategory.icon || 'star';
    categories.push(newCategory);
    saveCategories(categories);
    return true;
}

export function deleteCategory(name) {
    const defaultCategories = getDefaultCategories().map(c => c.name);
    if (defaultCategories.includes(name)) {
        return false; // Não permite deletar categorias padrão
    }
    let categories = getCategories();
    categories = categories.filter(c => c.name !== name);
    saveCategories(categories);
    return true;
}


// --- Lógica de Validação e Formato ---

export function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

export function applyBootstrapValidation(inputElement, isValid, feedbackMessage = '') {
    const formGroup = inputElement.closest('.form-validation-group, .input-group');

    if (!formGroup) {
        if (isValid) {
            inputElement.classList.remove('is-invalid');
            inputElement.classList.add('is-valid');
        } else {
            inputElement.classList.add('is-invalid');
            inputElement.classList.remove('is-valid');
        }
        return isValid;
    }

    let feedbackEl = formGroup.querySelector('.invalid-feedback');

    if (isValid) {
        inputElement.classList.remove('is-invalid');
        inputElement.classList.add('is-valid');
        if (feedbackEl) feedbackEl.textContent = '';
    } else {
        inputElement.classList.add('is-invalid');
        inputElement.classList.remove('is-valid');
        if (feedbackEl) feedbackEl.textContent = feedbackMessage;
    }
    return isValid;
}


// --- Funções de Cálculo ---

export function calculateTotals(transactions) {
    console.log('[CALCULATE-TOTALS] Calculando totais para', transactions.length, 'transações');
    
    let saldo = 0;
    let receita = 0;
    let despesa = 0;

    transactions.forEach((t, index) => {
        // Suporta tanto formato português quanto inglês
        const valor = parseFloat(t.valor || t.amount || 0);
        const tipo = t.tipo || (t.type === 'income' ? 'receita' : t.type === 'expense' ? 'despesa' : '');
        
        if (index === 0) {
            console.log('[CALCULATE-TOTALS] Exemplo de transação:', { valor, tipo, original: t });
        }
        
        if (tipo === 'receita') {
            saldo += valor;
            receita += valor;
        } else if (tipo === 'despesa') {
            saldo -= valor;
            despesa += valor;
        }
    });

    console.log('[CALCULATE-TOTALS] Resultado:', { saldo, receita, despesa });
    return { saldo, receita, despesa };
}

export function filterDashboardTransactions(transactions) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    console.log('[FILTER-DASHBOARD] Filtrando transações dos últimos 7 dias');
    console.log('[FILTER-DASHBOARD] Período:', sevenDaysAgo.toLocaleDateString(), 'até', today.toLocaleDateString());

    const filtered = transactions.filter(t => {
        // Suporta tanto 'data' quanto 'date'
        const dataStr = t.data || t.date;
        let transactionDate;
        
        if (dataStr.includes('T')) {
            transactionDate = new Date(dataStr);
        } else {
            transactionDate = new Date(dataStr + 'T00:00:00');
        }
        
        const isInRange = transactionDate >= sevenDaysAgo && transactionDate <= today;
        return isInRange;
    });
    
    console.log('[FILTER-DASHBOARD] Transações filtradas:', filtered.length, 'de', transactions.length);
    return filtered;
}

export function calculateTimeBasedData(transactions, periode, numPeriods) {
    const data = { periods: [], receita: [], despesa: [] };
    let totalsMap = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Lógica para determinar o tipo e o intervalo das datas
    let getPeriodKey; 
    let getPeriodLabel;
    
    if (periode === 'dia') {
        getPeriodKey = (date) => {
            if (!date || isNaN(date.getTime())) return null;
            return date.toISOString().split('T')[0];
        };
        getPeriodLabel = (date) => {
            if (!date || isNaN(date.getTime())) return 'Data inválida';
            return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        };
    } else if (periode === 'semana') {
        getPeriodKey = (date) => {
            if (!date || isNaN(date.getTime())) return null;
            return `${date.getFullYear()}-${Math.ceil((date.getMonth() * 30 + date.getDate()) / 7)}`;
        };
        getPeriodLabel = (date) => {
            if (!date || isNaN(date.getTime())) return 'Data inválida';
            const key = getPeriodKey(date);
            return key ? `Semana ${key.split('-')[1]}` : 'Data inválida';
        };
    } else if (periode === 'mes') {
        getPeriodKey = (date) => {
            if (!date || isNaN(date.getTime())) return null;
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        };
        getPeriodLabel = (date) => {
            if (!date || isNaN(date.getTime())) return 'Data inválida';
            return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        };
    } else if (periode === 'ano') {
        getPeriodKey = (date) => {
            if (!date || isNaN(date.getTime())) return null;
            return `${date.getFullYear()}`;
        };
        getPeriodLabel = (date) => {
            if (!date || isNaN(date.getTime())) return 'Data inválida';
            return `${date.getFullYear()}`;
        };
    }

    // Inicializa o mapa com os períodos
    let periods = [];
    
    for (let i = 0; i < numPeriods; i++) {
        let periodDate = new Date(today);
        
        if (periode === 'dia') {
            periodDate.setDate(today.getDate() - (numPeriods - 1 - i));
        } else if (periode === 'semana') {
            periodDate.setDate(today.getDate() - (numPeriods - 1 - i) * 7);
        } else if (periode === 'mes') {
            periodDate = new Date(today.getFullYear(), today.getMonth() - (numPeriods - 1 - i), 1);
        } else if (periode === 'ano') {
            periodDate = new Date(today.getFullYear() - (numPeriods - 1 - i), 0, 1);
        }

        const key = getPeriodKey(periodDate);
        if (key) {
            periods.push(key);
            totalsMap[key] = { receita: 0, despesa: 0, label: getPeriodLabel(periodDate) };
        }
    }
    data.periods = periods.map(key => totalsMap[key].label);

    // Processa as transações
    transactions.forEach(t => {
        try {
            // Tenta criar a data de diferentes formas
            let transactionDate;
            if (t.data.includes('T')) {
                transactionDate = new Date(t.data);
            } else {
                transactionDate = new Date(t.data + 'T00:00:00');
            }
            
            // Verifica se a data é válida
            if (isNaN(transactionDate.getTime())) {
                console.warn('[UTILS] Data inválida na transação:', t);
                return;
            }
            
            const key = getPeriodKey(transactionDate);
            const valor = parseFloat(t.valor);
            
            // Verifica se a transação está dentro dos períodos que inicializamos
            if (key && totalsMap[key]) {
                if (t.tipo === 'receita') {
                    totalsMap[key].receita += valor;
                } else if (t.tipo === 'despesa') {
                    totalsMap[key].despesa += valor;
                }
            }
        } catch (error) {
            console.error('[UTILS] Erro ao processar transação:', t, error);
        }
    });

    // Popula os arrays finais
    periods.forEach(key => {
        data.receita.push(totalsMap[key].receita);
        data.despesa.push(totalsMap[key].despesa);
    });

    return data;
}

export function generateHslColor(index) {
    const hue = (index * 137.508) % 360;
    return `hsl(${hue}, 70%, 50%)`;
}

export function calculateCategoryData(transactions, filterPeriod) {
    const totalsByCategory = {};
    let totalDespesas = 0;
    
    let filteredTransactions = transactions;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let startDate;

    if (filterPeriod !== 'all') {
        if (filterPeriod === 'mes') {
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        } else if (filterPeriod === '3meses') {
            startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        } else if (filterPeriod === '6meses') {
            startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1);
        } else if (filterPeriod === 'ano') {
            startDate = new Date(today.getFullYear(), 0, 1);
        }

        filteredTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.data + 'T00:00:00');
            return transactionDate >= startDate && transactionDate <= today;
        });
    }
    
    filteredTransactions.filter(t => t.tipo === 'despesa').forEach(t => {
        const valor = parseFloat(t.valor);
        if (totalsByCategory[t.categoria]) {
            totalsByCategory[t.categoria] += valor;
        } else {
            totalsByCategory[t.categoria] = valor;
        }
        totalDespesas += valor;
    });

    const labels = [];
    const data = [];
    const backgroundColors = [];
    let index = 0;
    
    for (const category in totalsByCategory) {
        if (totalsByCategory[category] > 0) {
            labels.push(`${category} (${((totalsByCategory[category] / totalDespesas) * 100).toFixed(1)}%)`);
            data.push(totalsByCategory[category]);
            backgroundColors.push(generateHslColor(index++));
        }
    }

    return { labels, data, backgroundColors, totalDespesas };
}