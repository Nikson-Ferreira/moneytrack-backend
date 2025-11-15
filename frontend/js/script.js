const STORAGE_USER_KEY = 'moneyTrackUser';
const STORAGE_TRANSACTIONS_KEY = 'moneyTrackTransactions';
const STORAGE_CATEGORIES_KEY = 'moneyTrackCategories';

let currentUser = {
    name: 'Usuário Padrão',
    email: 'nome@email.com',
    password: 'senha',
    photoURL: ''
};

function getDefaultCategories() {
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

function getCategories() {
    const categoriesJson = localStorage.getItem(STORAGE_CATEGORIES_KEY);
    const defaults = getDefaultCategories();

    if (!categoriesJson) {
        saveCategories(defaults);
        return defaults;
    }

    let categories = JSON.parse(categoriesJson);

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

function saveCategories(categories) {
    localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
}

function addCategory(newCategory) {
    const categories = getCategories();
    if (categories.some(c => c.name.toLowerCase() === newCategory.name.toLowerCase())) {
        return false;
    }
    newCategory.icon = newCategory.icon || 'star'; 
    categories.push(newCategory);
    saveCategories(categories);
    return true;
}

function deleteCategory(name) {
    const defaultCategories = getDefaultCategories().map(c => c.name);
    if (defaultCategories.includes(name)) {
        return false;
    }
    let categories = getCategories();
    categories = categories.filter(c => c.name !== name);
    saveCategories(categories);
    return true;
}

function saveUserData(user) {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
}

function loadUserData() {
    const storedUser = localStorage.getItem(STORAGE_USER_KEY);
    if (storedUser) {
        try {
            currentUser = { ...currentUser, ...JSON.parse(storedUser) }; 
        } catch (e) {
            console.error("Erro ao carregar usuário do localStorage:", e);
        }
    }
    getCategories(); 
}

function getTransactions() {
    const transactionsJson = localStorage.getItem(STORAGE_TRANSACTIONS_KEY);
    return transactionsJson ? JSON.parse(transactionsJson) : [];
}

function saveTransactions(transactions) {
    localStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify(transactions));
}

function addTransaction(newTransaction) {
    const categories = getCategories();
    const categoryInfo = categories.find(c => c.name === newTransaction.categoria);
    
    const transactions = getTransactions();
    newTransaction.id = Date.now();
    newTransaction.id = parseInt(newTransaction.id); 
    newTransaction.icon = categoryInfo ? categoryInfo.icon : 'question-circle';

    transactions.unshift(newTransaction);
    saveTransactions(transactions);
}

function updateTransaction(id, updatedTransaction) {
    const categories = getCategories();
    const categoryInfo = categories.find(c => c.name === updatedTransaction.categoria);

    let transactions = getTransactions();
    const index = transactions.findIndex(t => t.id === parseInt(id));
    if (index !== -1) {
        transactions[index] = { 
            ...updatedTransaction, 
            id: parseInt(id),
            icon: categoryInfo ? categoryInfo.icon : 'question-circle'
        }; 
        saveTransactions(transactions);
        return true;
    }
    return false;
}

function deleteTransaction(id) {
    let transactions = getTransactions();
    transactions = transactions.filter(t => t.id !== parseInt(id));
    saveTransactions(transactions);
}

function saveProfilePicture(dataUrl) {
    currentUser.photoURL = dataUrl;
    saveUserData(currentUser);
    updateProfileInfo();
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function applyBootstrapValidation(inputElement, isValid, feedbackMessage = '') {
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

function populateCategorySelect(selectId, selectedCategory = '') {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = '<option selected disabled value="">Selecione a Categoria</option>';

    const categories = getCategories();

    const receitaGroup = document.createElement('optgroup');
    receitaGroup.label = 'Receitas';
    const despesaGroup = document.createElement('optgroup');
    despesaGroup.label = 'Despesas';
    
    categories.forEach(c => {
        const option = document.createElement('option');
        option.value = c.name;
        option.textContent = c.name;
        if (c.name === selectedCategory) {
            option.selected = true;
        }

        if (c.type === 'receita') {
            receitaGroup.appendChild(option);
        } else {
            despesaGroup.appendChild(option);
        }
    });

    if(receitaGroup.children.length > 0) select.appendChild(receitaGroup);
    if(despesaGroup.children.length > 0) select.appendChild(despesaGroup);
}

function getCurrentDateFormatted() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function setupLogin() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            loginForm.classList.remove('was-validated'); 
            
            const emailInput = document.getElementById('email');
            const senhaInput = document.getElementById('senha');
            
            const email = emailInput.value;
            const senha = senhaInput.value;

            let isValid = true;

            if (email !== currentUser.email) {
                isValid = false;
                applyBootstrapValidation(emailInput, false, 'Email não encontrado ou incorreto.');
            } else {
                applyBootstrapValidation(emailInput, true);
            }

            if (senha !== currentUser.password) {
                isValid = false;
                applyBootstrapValidation(senhaInput, false, 'Senha incorreta.');
            } else {
                applyBootstrapValidation(senhaInput, true);
            }

            if (isValid) {
                window.location.href = 'dashboard.html';
            }
        });
    }
}

function setupCadastro() {
    const cadastroForm = document.getElementById('cadastroForm');
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', (e) => {
            e.preventDefault();
            cadastroForm.classList.remove('was-validated'); 

            const nomeInput = document.getElementById('nome');
            const emailInput = document.getElementById('email');
            const senhaInput = document.getElementById('senha');
            
            const nome = nomeInput.value.trim();
            const email = emailInput.value.trim();
            const senha = senhaInput.value;
            
            let formIsValid = true;

            if (nome.length < 3) {
                formIsValid = false;
                applyBootstrapValidation(nomeInput, false, 'O nome deve ter pelo menos 3 caracteres.');
            } else {
                applyBootstrapValidation(nomeInput, true);
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                formIsValid = false;
                applyBootstrapValidation(emailInput, false, 'Formato de email inválido.');
            } else {
                applyBootstrapValidation(emailInput, true);
            }

            if (senha.length < 6) {
                formIsValid = false;
                applyBootstrapValidation(senhaInput, false, 'A senha deve ter pelo menos 6 caracteres.');
            } else {
                applyBootstrapValidation(senhaInput, true);
            }


            if (formIsValid) {
                const newUser = { name: nome, email, password: senha, photoURL: '' };
                saveUserData(newUser);
                currentUser = newUser;
                alert(`Usuário ${nome} cadastrado com sucesso! Redirecionando para o Login.`);
                window.location.href = 'index.html';
            }
        });
    }
}

function setupNovaTransacao() {
    const modalElement = document.getElementById('modalNovaTransacao');
    const form = document.getElementById('formNovaTransacao');
    
    if (!modalElement || !form) return;

    modalElement.addEventListener('show.bs.modal', function () {
        populateCategorySelect('categoriaTransacao'); 
        document.getElementById('dataTransacao').value = getCurrentDateFormatted();
        form.classList.remove('was-validated'); 
        form.reset();
        document.getElementById('tipoReceita').checked = true;
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const valorInput = document.getElementById('valorTransacao');
        const descricaoInput = document.getElementById('descricaoTransacao');
        const categoriaInput = document.getElementById('categoriaTransacao');
        const dataInput = document.getElementById('dataTransacao');
        const tipoInput = form.querySelector('input[name="tipoTransacao"]:checked');

        let formIsValid = true;

        const valor = parseFloat(valorInput.value);
        const descricao = descricaoInput.value.trim();
        const categoria = categoriaInput.value;
        const data = dataInput.value;
        const tipo = tipoInput ? tipoInput.value : '';

        if (isNaN(valor) || valor <= 0) {
            formIsValid = false;
            applyBootstrapValidation(valorInput, false, 'O valor deve ser positivo.');
        } else {
            applyBootstrapValidation(valorInput, true);
        }

        if (descricao.length === 0) {
            formIsValid = false;
            applyBootstrapValidation(descricaoInput, false, 'A descrição é obrigatória.');
        } else {
            applyBootstrapValidation(descricaoInput, true);
        }

        if (!categoria) {
            formIsValid = false;
            applyBootstrapValidation(categoriaInput, false, 'Selecione uma categoria.');
        } else {
            applyBootstrapValidation(categoriaInput, true);
        }
        
        if (!data) {
             formIsValid = false;
            applyBootstrapValidation(dataInput, false, 'A data é obrigatória.');
        } else {
            applyBootstrapValidation(dataInput, true);
        }


        if (formIsValid) {
            const newTransaction = { tipo, valor, descricao, categoria, data };
            addTransaction(newTransaction);
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal.hide();

            renderInitialData(); 
        }
    });
}

function setupEditTransacao() {
    const modalElement = document.getElementById('modalEditarTransacao');
    const form = document.getElementById('formEditarTransacao');
    
    if (!modalElement || !form) return;
    
    modalElement.addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget;
        const transactionId = button.getAttribute('data-id');
        const transactions = getTransactions();
        const transaction = transactions.find(t => t.id === parseInt(transactionId));
        
        if (!transaction) return; 

        this.querySelector('#editTransactionId').value = transactionId;
        this.querySelector('#valorTransacaoEdit').value = transaction.valor;
        this.querySelector('#descricaoTransacaoEdit').value = transaction.descricao;
        this.querySelector('#dataTransacaoEdit').value = transaction.data;
        
        populateCategorySelect('categoriaTransacaoEdit', transaction.categoria); 

        const tipoReceita = this.querySelector('#tipoReceitaEdit');
        const tipoDespesa = this.querySelector('#tipoDespesaEdit');
        
        tipoReceita.checked = transaction.tipo === 'receita';
        tipoDespesa.checked = transaction.tipo === 'despesa';
        
        form.classList.remove('was-validated'); 
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = document.getElementById('editTransactionId').value;
        const valorInput = document.getElementById('valorTransacaoEdit');
        const descricaoInput = document.getElementById('descricaoTransacaoEdit');
        const categoriaInput = document.getElementById('categoriaTransacaoEdit');
        const dataInput = document.getElementById('dataTransacaoEdit');
        const tipoInput = form.querySelector('input[name="tipoTransacaoEdit"]:checked');

        let formIsValid = true;

        const valor = parseFloat(valorInput.value);
        const descricao = descricaoInput.value.trim();
        const categoria = categoriaInput.value;
        const data = dataInput.value;
        const tipo = tipoInput ? tipoInput.value : '';

        if (isNaN(valor) || valor <= 0) {
            formIsValid = false;
            applyBootstrapValidation(valorInput, false, 'O valor deve ser positivo.');
        } else {
            applyBootstrapValidation(valorInput, true);
        }
        if (descricao.length === 0) {
            formIsValid = false;
            applyBootstrapValidation(descricaoInput, false, 'A descrição é obrigatória.');
        } else {
            applyBootstrapValidation(descricaoInput, true);
        }
        if (!categoria) {
            formIsValid = false;
            applyBootstrapValidation(categoriaInput, false, 'Selecione uma categoria.');
        } else {
            applyBootstrapValidation(categoriaInput, true);
        }
        if (!data) {
             formIsValid = false;
            applyBootstrapValidation(dataInput, false, 'A data é obrigatória.');
        } else {
            applyBootstrapValidation(dataInput, true);
        }
        
        if (formIsValid) {
            const updatedTransaction = { tipo, valor, descricao, categoria, data };
            
            updateTransaction(id, updatedTransaction);
            
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal.hide();

            if (window.location.pathname.includes('historico.html')) {
                renderHistorico(getTransactions().sort((a, b) => new Date(b.data) - new Date(a.data)));
            }
        }
    });
}

function setupHistoricoListeners() {
    document.addEventListener('click', function(e) {
        const deleteButton = e.target.closest('.delete-btn');
        if (deleteButton) {
            const transactionId = deleteButton.getAttribute('data-id');
            if (confirm('Tem certeza que deseja excluir esta transação?')) {
                deleteTransaction(transactionId);
                
                if (window.location.pathname.includes('dashboard.html')) {
                    renderInitialData(); 
                } else if (window.location.pathname.includes('historico.html')) {
                    setupHistoricoFilter(); 
                }
            }
        }
    });
}

function calculateTotals(transactions) {
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

function filterDashboardTransactions(transactions) {
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

function calculateTimeBasedData(transactions, periode, numPeriods) {
    const data = { periods: [], receita: [], despesa: [] };
    let totalsMap = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (periode === 'dia' || periode === 'semana') {
        numPeriods = 7;
        for (let i = numPeriods - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = d.toISOString().split('T')[0];
            const label = i === 0 ? 'Hoje' : d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
            
            data.periods.push(label);
            totalsMap[key] = { receita: 0, despesa: 0 };
        }
        
        transactions.forEach(t => {
            const dateKey = t.data;
            if (totalsMap[dateKey]) {
                const valor = parseFloat(t.valor);
                if (t.tipo === 'receita') totalsMap[dateKey].receita += valor;
                if (t.tipo === 'despesa') totalsMap[dateKey].despesa += valor;
            }
        });
    } 

    else if (periode === 'mes') {
        numPeriods = numPeriods || 4;
        for (let i = numPeriods - 1; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');
            
            data.periods.push(label);
            totalsMap[key] = { receita: 0, despesa: 0 };
        }
        
        transactions.forEach(t => {
            const date = new Date(t.data);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (totalsMap[key]) {
                const valor = parseFloat(t.valor);
                if (t.tipo === 'receita') totalsMap[key].receita += valor;
                if (t.tipo === 'despesa') totalsMap[key].despesa += valor;
            }
        });
    } 

    else if (periode === 'ano') {
        numPeriods = numPeriods || 4; 
        for (let i = numPeriods - 1; i >= 0; i--) {
            const year = today.getFullYear() - i;
            const key = String(year);
            
            data.periods.push(key);
            totalsMap[key] = { receita: 0, despesa: 0 };
        }
        
        transactions.forEach(t => {
            const date = new Date(t.data);
            const key = String(date.getFullYear());
            if (totalsMap[key]) {
                const valor = parseFloat(t.valor);
                if (t.tipo === 'receita') totalsMap[key].receita += valor;
                if (t.tipo === 'despesa') totalsMap[key].despesa += valor;
            }
        });
    }
    
    data.periods.forEach((periodLabel, index) => {
        let key;

        if (periode === 'dia' || periode === 'semana') {
            const date = new Date(today);
            date.setDate(today.getDate() - (numPeriods - 1 - index));
            key = date.toISOString().split('T')[0];
        } else if (periode === 'mes') {
            const month = today.getMonth() - (numPeriods - 1 - index);
            const year = today.getFullYear();
            const d = new Date(year, month, 1);
            key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        } else if (periode === 'ano') {
            key = periodLabel; 
        }

        const totals = totalsMap[key] || { receita: 0, despesa: 0 };
        data.receita.push(totals.receita);
        data.despesa.push(totals.despesa);
    });

    return data;
}

function calculateCategoryData(transactions, filterPeriod) {
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

function generateHslColor(index) {
    const hue = (index * 137.508) % 360;
    return `hsl(${hue}, 70%, 50%)`;
}

let graficoVisaoPeriodoInstance = null;
let graficoReceitasDespesasInstance = null;
let gastosCategoriaChartInstance = null;

function renderGraficoVisaoPeriodo(periodo) {
    const ctx = document.getElementById('graficoVisaoPeriodo')?.getContext('2d');
    if (!ctx) return;
    
    const transactions = getTransactions();
    const data = calculateTimeBasedData(transactions, periodo, 7);

    if (graficoVisaoPeriodoInstance) {
        graficoVisaoPeriodoInstance.destroy();
    }
    
    graficoVisaoPeriodoInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.periods,
            datasets: [
                {
                    label: 'Receitas',
                    data: data.receita,
                    backgroundColor: 'rgba(25, 135, 84, 0.8)',
                    borderColor: 'rgba(25, 135, 84, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Despesas',
                    data: data.despesa,
                    backgroundColor: 'rgba(220, 53, 69, 0.8)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: (value) => formatCurrency(value) }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            let label = context.dataset.label || '';
                            if (label) { label += ': '; }
                            if (context.parsed.y !== null) { label += formatCurrency(context.parsed.y); }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function setupDashboardPeriodoToggle() {
    const toggleContainer = document.getElementById('dashboard-periodo-toggle');
    renderGraficoVisaoPeriodo('dia'); 

    if (!toggleContainer) return;

    toggleContainer.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function() {
            const periodo = this.dataset.periodo;
            toggleContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            renderGraficoVisaoPeriodo(periodo);
        });
    });
}

function renderGraficoGastosCategoria(categoryData) {
    const ctx = document.getElementById('gastosCategoriaChart')?.getContext('2d');
    if (!ctx) return;
    
    if (gastosCategoriaChartInstance) {
        gastosCategoriaChartInstance.destroy();
    }
    
    const { labels, data, backgroundColors, totalDespesas } = categoryData;
    const parentNode = ctx.canvas.parentNode;

    if (totalDespesas === 0) {
        if (parentNode.querySelector('canvas')) {
            parentNode.querySelector('canvas').style.display = 'none';
        }
        if (!parentNode.querySelector('.no-data-msg')) {
            parentNode.insertAdjacentHTML('beforeend', '<p class="text-center text-muted m-4 no-data-msg">Nenhuma despesa encontrada para o período selecionado.</p>');
        }
        return;
    } 
    
    if (parentNode.querySelector('.no-data-msg')) {
        parentNode.querySelector('.no-data-msg').remove();
    }
    if (parentNode.querySelector('canvas')) {
        parentNode.querySelector('canvas').style.display = 'block';
    } else {
        parentNode.innerHTML = '<canvas id="gastosCategoriaChart"></canvas>';
        ctx = document.getElementById('gastosCategoriaChart').getContext('2d');
    }
    
    gastosCategoriaChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' }, 
                title: { display: true, text: `Total de Despesas: ${formatCurrency(totalDespesas)}` },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            let label = context.label || '';
                            if (context.parsed !== null) { label = label.split(' (')[0] + ': ' + formatCurrency(context.parsed); }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function renderGraficoReceitasDespesas(periodo) {
    const ctx = document.getElementById('graficoReceitasDespesas')?.getContext('2d');
    if (!ctx) return;
    
    const transactions = getTransactions();
    const data = calculateTimeBasedData(transactions, periodo, 4); 

    if (graficoReceitasDespesasInstance) {
        graficoReceitasDespesasInstance.destroy();
    }
    
    graficoReceitasDespesasInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.periods,
            datasets: [
                { label: 'Receitas', data: data.receita, backgroundColor: 'rgba(25, 135, 84, 0.8)', borderWidth: 1 },
                { label: 'Despesas', data: data.despesa, backgroundColor: 'rgba(220, 53, 69, 0.8)', borderWidth: 1 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, ticks: { callback: (value) => formatCurrency(value) } }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            let label = context.dataset.label || '';
                            if (label) { label += ': '; }
                            if (context.parsed.y !== null) { label += formatCurrency(context.parsed.y); }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function setupHistoricoFilter() {
    const transactions = getTransactions().sort((a, b) => new Date(b.data) - new Date(a.data));
    const buscaCategoria = document.getElementById('buscaCategoria');
    
    const categories = getCategories();
    categories.filter(c => c.type === 'despesa').forEach(c => {
        const option = document.createElement('option');
        option.value = c.name;
        option.textContent = c.name;
        buscaCategoria.appendChild(option);
    });

    const filterAndRender = () => {
        const selectedCategory = buscaCategoria.value;
        let filtered = transactions;
        
        if (selectedCategory) {
            filtered = transactions.filter(t => t.categoria === selectedCategory);
        }
        
        renderHistorico(filtered);
    };

    buscaCategoria.addEventListener('change', filterAndRender);
    
    filterAndRender();
}

function renderHistorico(transactions) {
    const historicoList = document.getElementById('historico-list');
    historicoList.innerHTML = '';

    if (transactions.length === 0) {
        historicoList.innerHTML = '<div class="card shadow-sm"><div class="card-body text-center text-muted">Nenhuma transação encontrada.</div></div>';
        return;
    }

    const groupedByMonth = transactions.reduce((acc, t) => {
        const date = new Date(t.data + 'T00:00:00');
        const monthYear = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        if (!acc[monthYear]) { acc[monthYear] = []; }
        acc[monthYear].push(t);
        return acc;
    }, {});

    for (const monthYear in groupedByMonth) {
        const card = document.createElement('div');
        card.className = 'card shadow-sm mb-3';
        card.innerHTML = `<div class="card-header bg-light text-primary fw-bold">${monthYear}</div>`;

        const listGroup = document.createElement('ul');
        listGroup.className = 'list-group list-group-flush';
        
        groupedByMonth[monthYear].forEach(t => {
            const isReceita = t.tipo === 'receita';
            const badgeClass = isReceita ? 'text-bg-success' : 'text-bg-danger';
            const sign = isReceita ? '+' : '-';
            
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            listItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="bi bi-${t.icon} me-3 fs-5 text-primary"></i> 
                    <div>
                        <span class="d-block">${t.descricao}</span>
                        <small class="text-muted">${t.categoria} (${new Date(t.data + 'T00:00:00').toLocaleDateString('pt-BR')})</small>
                    </div>
                </div>
                <div class="d-flex align-items-center">
                    <span class="badge ${badgeClass} rounded-pill me-2">${sign} ${formatCurrency(t.valor)}</span>
                    <button class="btn btn-sm btn-outline-warning me-1" 
                        data-bs-toggle="modal" data-bs-target="#modalEditarTransacao" 
                        data-id="${t.id}" aria-label="Editar Transação">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${t.id}" aria-label="Excluir Transação">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            `;
            listGroup.appendChild(listItem);
        });
        card.appendChild(listGroup);
        historicoList.appendChild(card);
    }
}

function renderRecentTransactions(transactions) {
    const list = document.getElementById('recent-transactions-list');
    if (!list) return;

    list.innerHTML = '';
    
    const recent = transactions.slice(0, 5);

    if (recent.length === 0) {
        list.innerHTML = '<li class="list-group-item text-center text-muted">Nenhuma transação registrada.</li>';
        return;
    }

    recent.forEach(t => {
        const isReceita = t.tipo === 'receita';
        const badgeClass = isReceita ? 'text-bg-success' : 'text-bg-danger';
        const sign = isReceita ? '+' : '-';
        
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        listItem.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-${t.icon} me-3 fs-5 text-primary"></i> 
                <div>
                    <span class="d-block">${t.descricao}</span>
                    <small class="text-muted">${t.categoria} (${new Date(t.data + 'T00:00:00').toLocaleDateString('pt-BR')})</small>
                </div>
            </div>
            <div class="d-flex align-items-center">
                <span class="badge ${badgeClass} rounded-pill me-2">${sign} ${formatCurrency(t.valor)}</span>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${t.id}" aria-label="Excluir Transação">
                    <i class="bi bi-x-lg delete-btn" data-id="${t.id}"></i>
                </button>
            </div>
        `;
        list.appendChild(listItem);
    });
}

function renderInitialData() {
    const transactions = getTransactions();
    
    const { saldo: saldoGeral } = calculateTotals(transactions);
    
    const recentTransactions = filterDashboardTransactions(transactions);
    const { receita: receita7Dias, despesa: despesa7Dias } = calculateTotals(recentTransactions);
    
    const saldoEl = document.getElementById('saldo-total');
    if (saldoEl) saldoEl.textContent = formatCurrency(saldoGeral);
    
    const receitaEl = document.getElementById('receita-total');
    if (receitaEl) receitaEl.textContent = formatCurrency(receita7Dias);
    
    const despesaEl = document.getElementById('despesa-total');
    if (despesaEl) despesaEl.textContent = formatCurrency(despesa7Dias);

    renderRecentTransactions(transactions);
    setupDashboardPeriodoToggle();
}

function setupCategoryManagement() {
    const modalEl = document.getElementById('modalGerenciarCategorias');
    const form = document.getElementById('formNovaCategoria');
    if (!modalEl || !form) return;

    function renderCategoryList() {
        const list = document.getElementById('categoryList');
        if (!list) return;
        list.innerHTML = '';
        
        const categories = getCategories();
        const defaultCategories = getDefaultCategories().map(c => c.name);

        categories.forEach(c => {
            const isDefault = defaultCategories.includes(c.name);
            const icon = c.type === 'receita' ? 'arrow-up-circle' : 'arrow-down-circle';
            const badgeClass = c.type === 'receita' ? 'text-bg-success' : 'text-bg-danger';

            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            listItem.innerHTML = `
                <div>
                    <i class="bi bi-${icon} me-2 ${c.type === 'receita' ? 'text-success' : 'text-danger'}"></i>
                    ${c.name} 
                    <span class="badge ${badgeClass} ms-2">${c.type === 'receita' ? 'R' : 'D'}</span>
                </div>
                ${!isDefault ? `<button class="btn btn-sm btn-outline-danger delete-category-btn" data-category-name="${c.name}">
                    <i class="bi bi-trash"></i>
                </button>` : `<span class="text-muted small">Padrão</span>`}
            `;
            list.appendChild(listItem);
        });
    }

    modalEl.addEventListener('show.bs.modal', function () {
        renderCategoryList();
        form.classList.remove('was-validated'); 
        form.reset();
        form.querySelectorAll('.form-control, .form-select').forEach(el => {
            el.classList.remove('is-invalid');
            el.classList.remove('is-valid');
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nomeInput = document.getElementById('novaCategoriaNome');
        const tipoInput = document.getElementById('novaCategoriaTipo');
        
        const name = nomeInput.value.trim();
        const type = tipoInput.value;
        
        let formIsValid = true;

        if (name.length < 2) {
            formIsValid = false;
            applyBootstrapValidation(nomeInput, false, 'O nome deve ter pelo menos 2 caracteres.');
        } else {
            applyBootstrapValidation(nomeInput, true);
        }

        if (!type) {
            formIsValid = false;
            applyBootstrapValidation(tipoInput, false, 'Selecione o tipo.');
        } else {
             applyBootstrapValidation(tipoInput, true);
        }
        
        if (formIsValid) {
            const newCategory = { name, type };
            const added = addCategory(newCategory);
            
            if (added) {
                renderCategoryList();
                nomeInput.value = '';
                tipoInput.value = '';
                nomeInput.classList.remove('is-valid');
                tipoInput.classList.remove('is-valid');
            } else {
                applyBootstrapValidation(nomeInput, false, 'Categoria com este nome já existe.');
            }
        }
    });

    document.addEventListener('click', function(e) {
        const deleteButton = e.target.closest('.delete-category-btn');
        if (deleteButton) {
            const categoryName = deleteButton.getAttribute('data-category-name');
            if (confirm(`Tem certeza que deseja excluir a categoria "${categoryName}"?`)) {
                const deleted = deleteCategory(categoryName);
                if (deleted) {
                    renderCategoryList();
                } else {
                    alert('Erro: Não foi possível excluir a categoria.');
                }
            }
        }
    });
}

function setupProfilePictureUpload() {
    const photoInput = document.getElementById('profilePhotoInput');
    if (photoInput) {
        photoInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    saveProfilePicture(e.target.result);
                    alert('Foto de perfil salva com sucesso!');
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

function updateProfileInfo() {
    const dashboardHeaderName = document.getElementById('dashboardHeaderName');
    if (dashboardHeaderName) {
        dashboardHeaderName.textContent = `Olá, ${currentUser.name.split(' ')[0]}!`; 
    }
    
    const offcanvasNames = document.querySelectorAll('.perfil-nome');
    offcanvasNames.forEach(el => { if (el) el.textContent = currentUser.name; });
    const offcanvasEmails = document.querySelectorAll('.perfil-email');
    offcanvasEmails.forEach(el => { if (el) el.textContent = currentUser.email; });

    const photoURL = currentUser.photoURL;
    const profileImages = document.querySelectorAll('.perfil-img');
    const profileIcons = document.querySelectorAll('.perfil-icon, .perfil-icon-offcanvas');

    if (photoURL) {
        profileImages.forEach(img => {
            img.src = photoURL;
            img.classList.remove('d-none');
        });
        profileIcons.forEach(icon => {
            icon.classList.add('d-none');
        });
    } else {
        profileImages.forEach(img => {
            img.classList.add('d-none');
            img.src = '';
        });
        profileIcons.forEach(icon => {
            icon.classList.remove('d-none');
        });
    }
}

function setupRelatoriosFilter() {
    const transactions = getTransactions();
    
    const toggleContainer = document.getElementById('relatorios-periodo-toggle');
    renderGraficoReceitasDespesas('mes'); 

    if (toggleContainer) {
        toggleContainer.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', function() {
                const periodo = this.dataset.periodo;
                toggleContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                renderGraficoReceitasDespesas(periodo);
            });
        });
    }
    
    const categoriaFilter = document.getElementById('filtroPeriodoCategoria');
    
    const initialCategoryData = calculateCategoryData(transactions, 'all');
    renderGraficoGastosCategoria(initialCategoryData);
    
    if (categoriaFilter) {
        categoriaFilter.addEventListener('change', function() {
            const periodo = this.value;
            const categoryData = calculateCategoryData(transactions, periodo);
            renderGraficoGastosCategoria(categoryData);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    updateProfileInfo();
    setupProfilePictureUpload();
    setupCategoryManagement();
    setupHistoricoListeners();

    if (window.location.pathname.includes('index.html')) {
        setupLogin();
    }
    if (window.location.pathname.includes('cadastro.html')) {
        setupCadastro();
    }
    
    if (window.location.pathname.includes('dashboard.html')) {
        setupNovaTransacao();
        renderInitialData();
    }
    
    if (window.location.pathname.includes('historico.html')) {
        setupEditTransacao();
        setupHistoricoFilter(); 
    }

    if (window.location.pathname.includes('relatorios.html')) {
        setupRelatoriosFilter();
    }
});