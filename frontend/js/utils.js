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
    const categoriesJson = localStorage.getItem(STORAGE_CATEGORIES_KEY);
    const defaults = getDefaultCategories();

    if (!categoriesJson) {
        saveCategories(defaults);
        return defaults;
    }

    let categories = JSON.parse(categoriesJson);

    // Garante que as categorias salvas tenham ícones, usando defaults como fallback
    categories = categories.map(cat => {
        const def = defaults.find(d => d.name === cat.name);
        return {
            ...cat,
            icon: cat.icon || (def ? def.icon : 'question-circle')
        };
    });

    saveCategories(categories);
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
    let saldo = 0;
    let receita = 0;
    let despesa = 0;

    transactions.forEach(t => {
        const valor = parseFloat(t.valor); 
        if (t.tipo === 'receita') {
            saldo += valor;
            receita += valor;
        } else if (t.tipo === 'despesa') {
            saldo -= valor;
            despesa += valor;
        }
    });

    return { saldo, receita, despesa };
}

export function filterDashboardTransactions(transactions) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0); 

    return transactions.filter(t => {
        const transactionDate = new Date(t.data + 'T00:00:00');
        return transactionDate >= sevenDaysAgo && transactionDate <= today;
    });
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
        getPeriodKey = (date) => date.toISOString().split('T')[0];
        getPeriodLabel = (date) => date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } else if (periode === 'semana') {
        getPeriodKey = (date) => `${date.getFullYear()}-${Math.ceil((date.getMonth() * 30 + date.getDate()) / 7)}`; // Simplificado
        getPeriodLabel = (date) => `Semana ${getPeriodKey(date).split('-')[1]}`;
    } else if (periode === 'mes') {
        getPeriodKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        getPeriodLabel = (date) => date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    } else if (periode === 'ano') {
        getPeriodKey = (date) => `${date.getFullYear()}`;
        getPeriodLabel = (date) => `${date.getFullYear()}`;
    }

    // Inicializa o mapa com os períodos
    let currentStartDate = new Date(today);
    let periods = [];
    
    for (let i = 0; i < numPeriods; i++) {
        // Ajuste o currentStartDate com base no período
        let periodDate = new Date(currentStartDate);
        
        if (periode === 'dia' || periode === 'semana') {
             // Mantemos a data de início para o loop
        } else if (periode === 'mes') {
            periodDate.setMonth(today.getMonth() - (numPeriods - 1 - i));
            periodDate.setDate(1); // Início do mês
        } else if (periode === 'ano') {
            periodDate.setFullYear(today.getFullYear() - (numPeriods - 1 - i));
            periodDate.setMonth(0, 1); // Início do ano
        }

        const key = getPeriodKey(periodDate);
        periods.push(key);
        totalsMap[key] = { receita: 0, despesa: 0, label: getPeriodLabel(periodDate) };
    }
    data.periods = periods.map(key => totalsMap[key].label);

    // Processa as transações
    transactions.forEach(t => {
        const transactionDate = new Date(t.data + 'T00:00:00');
        const key = getPeriodKey(transactionDate);
        const valor = parseFloat(t.valor);
        
        // Verifica se a transação está dentro dos períodos que inicializamos
        if (totalsMap[key]) {
            if (t.tipo === 'receita') {
                totalsMap[key].receita += valor;
            } else if (t.tipo === 'despesa') {
                totalsMap[key].despesa += valor;
            }
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