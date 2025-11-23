import * as TransactionService from './transactionService.js';
import * as AuthService from './authService.js';
import { 
    formatCurrency, 
    calculateTotals, 
    filterDashboardTransactions,
    calculateTimeBasedData,
    calculateCategoryData,
    getCategories,
    getDefaultCategories,
    addCategory,
    deleteCategory,
    applyBootstrapValidation
} from './utils.js';

let currentUser = AuthService.loadUserData() || {};

// --- DASHBOARD E INFORMAÇÕES GERAIS ---

async function renderInitialData() {
    const saldoEl = document.getElementById('saldo-total');
    const receitaEl = document.getElementById('receita-total');
    const despesaEl = document.getElementById('despesa-total');
    const ultimasTransacoesList = document.getElementById('ultimas-transacoes-list');

    if (!saldoEl) return; 

    try {
        const allTransactions = await TransactionService.getTransactions();
        
        const { saldo: saldoGeral, receita: receitaGeral, despesa: despesaGeral } = calculateTotals(allTransactions);
        
        const recentTransactions = filterDashboardTransactions(allTransactions);
        const { receita: receita7Dias, despesa: despesa7Dias } = calculateTotals(recentTransactions);

        saldoEl.textContent = formatCurrency(saldoGeral);
        receitaEl.textContent = formatCurrency(receita7Dias);
        despesaEl.textContent = formatCurrency(despesa7Dias);
        
        ultimasTransacoesList.innerHTML = '';
        if (allTransactions.length === 0) {
            ultimasTransacoesList.innerHTML = '<li class="list-group-item text-center text-muted">Nenhuma transação registrada.</li>';
        } else {
            allTransactions.sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 5).forEach(t => {
                const isReceita = t.tipo === 'receita';
                const sign = isReceita ? '+' : '-';
                const color = isReceita ? 'text-success' : 'text-danger';
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                li.innerHTML = `
                    <i class="bi bi-${t.icon} me-2 ${color}"></i>
                    <span>${t.descricao} <small class="text-muted">(${t.categoria})</small></span>
                    <span class="${color} fw-bold">${sign} ${formatCurrency(t.valor)}</span>
                `;
                ultimasTransacoesList.appendChild(li);
            });
        }
        
        setupDashboardPeriodoToggle();
        renderGraficoVisaoPeriodo('dia'); // Inicializa o gráfico de Visão Geral com o período 'dia'
        
        const categoryData = calculateCategoryData(allTransactions, 'mes');
        renderGraficoGastosCategoria(categoryData);

    } catch (error) {
        console.error("Erro ao carregar dados iniciais do Dashboard:", error);
    }
}

// --- AUTENTICAÇÃO E CADASTRO ---

async function handleLoginSubmit(e) { 
    console.log("TESTE: O listener do Cadastro foi acionado e e.preventDefault() será chamado.");
    e.preventDefault();
    e.preventDefault();
    const loginForm = document.getElementById('loginForm');
    loginForm.classList.remove('was-validated');

    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');

    const email = emailInput.value;
    const senha = senhaInput.value;
    
    applyBootstrapValidation(emailInput, true);
    applyBootstrapValidation(senhaInput, true);

    if (!email || !senha) {
        loginForm.classList.add('was-validated');
        return;
    }

    try {
        const result = await AuthService.login(email, senha); 

        if (result.success) {
            window.location.href = 'dashboard.html';
        } else {
            const errorMessage = result.message || 'Email ou senha inválidos.';
            applyBootstrapValidation(emailInput, false, errorMessage);
            applyBootstrapValidation(senhaInput, false, ' '); 
        }
    } catch (error) {
        console.error("Erro durante o login:", error);
        alert("Erro de conexão. Tente novamente mais tarde.");
    }
}

function setupLogin() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
}


async function handleCadastroSubmit(e) {
    console.log("TESTE: O listener do Cadastro foi acionado e e.preventDefault() será chamado.");
    e.preventDefault();
    // 1. Impedir o comportamento padrão do navegador (recarregar a página)
    e.preventDefault();

    const cadastroForm = document.getElementById('cadastroForm');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    
    // Resetar a validação do Bootstrap em todos os campos
    applyBootstrapValidation(nomeInput, true);
    applyBootstrapValidation(emailInput, true);
    applyBootstrapValidation(senhaInput, true);

    // 2. Coletar dados
    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    // 3. Validação de Frontend Básica (Garantir que os campos não estão vazios)
    let isFormValid = true;

    if (!nome) {
        applyBootstrapValidation(nomeInput, false, 'O nome é obrigatório.');
        isFormValid = false;
    }
    if (!email || !email.includes('@')) {
        applyBootstrapValidation(emailInput, false, 'Insira um email válido.');
        isFormValid = false;
    }
    if (!senha || senha.length < 6) {
        applyBootstrapValidation(senhaInput, false, 'A senha deve ter pelo menos 6 caracteres.');
        isFormValid = false;
    }

    if (!isFormValid) {
        // Se a validação do frontend falhar, parar a execução
        return;
    }

    // 4. Chamar o Serviço de Autenticação (Backend)
    try {
        const userData = { nome, email, senha };
        
        // Chamada à API de Cadastro
        const result = await AuthService.registerUser(userData);

        if (result.success) {
            // SUCESSO: Cadastro realizado e API retornou 201 Created
            alert(`Usuário ${nome.split(' ')[0]} cadastrado com sucesso! Redirecionando para o Login.`);
            window.location.href = 'index.html';

        } else if (result.status === 400 && result.data && result.data.detail) {
            // ERRO 400 (Bad Request): Geralmente email já cadastrado ou validação do backend
            
            // Exemplo de erro comum do backend: 'User with this email already exists'
            const errorMessage = result.data.detail.includes('email') 
                ? 'Este email já está cadastrado.'
                : 'Erro de validação: Verifique seus dados.';
                
            applyBootstrapValidation(emailInput, false, errorMessage);
            
        } else {
            // Outros Erros HTTP (404, 500, etc. que não foram pegos pelo 'catch')
            alert("Erro desconhecido ao cadastrar usuário. Tente novamente.");
            console.error("Erro inesperado da API:", result);
        }

    } catch (error) {
        // 5. Falha de Rede/Servidor (Servidor offline, CORS, ou erro 5xx que não foi tratado explicitamente)
        console.error("Falha ao registrar usuário:", error);
        alert("Falha de comunicação com o servidor. Verifique sua conexão ou tente mais tarde.");
    }
}

function setupCadastro() {
    const cadastroForm = document.getElementById('cadastroForm');
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', handleCadastroSubmit);
    }
}

// --- CRUD: NOVA TRANSAÇÃO ---

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

    form.addEventListener('submit', async (e) => {
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
            
            try {
                await TransactionService.addTransaction(newTransaction); 
                
                const modal = bootstrap.Modal.getInstance(modalElement);
                modal.hide();

                // Recarrega o conteúdo da página atual
                if (window.location.pathname.includes('historico.html')) {
                    setupHistoricoFilter();
                } else {
                    renderInitialData(); 
                }
                
            } catch (error) {
                console.error("Erro ao criar transação:", error);
                alert("Falha ao salvar a transação. Tente novamente.");
            }
        }
    });
}

// --- CRUD: EDITAR TRANSAÇÃO ---

function setupEditTransacao() {
    const modalElement = document.getElementById('modalEditarTransacao');
    const form = document.getElementById('formEditarTransacao');
    
    if (!modalElement || !form) return;
    
    modalElement.addEventListener('show.bs.modal', async function (event) { 
        const button = event.relatedTarget;
        const transactionId = button.getAttribute('data-id');
        
        try {
            // OBS: Buscar todas as transações pode ser ineficiente para grandes volumes. 
            // O ideal seria ter um endpoint TransactionService.getTransactionById(id)
            const transactions = await TransactionService.getTransactions(); 
            const transaction = transactions.find(t => t.id === parseInt(transactionId));
            
            if (!transaction) return; 

            this.querySelector('#editTransactionId').value = transactionId;
            this.querySelector('#valorTransacaoEdit').value = transaction.valor; 
            this.querySelector('#descricaoTransacaoEdit').value = transaction.descricao;
            this.querySelector('#dataTransacaoEdit').value = transaction.data.substring(0, 10); // Garante formato YYYY-MM-DD
            
            populateCategorySelect('categoriaTransacaoEdit', transaction.categoria); 

            const tipoReceita = this.querySelector('#tipoReceitaEdit');
            const tipoDespesa = this.querySelector('#tipoDespesaEdit');
            
            tipoReceita.checked = transaction.tipo === 'receita';
            tipoDespesa.checked = transaction.tipo === 'despesa';
            
            form.classList.remove('was-validated'); 
            
        } catch (error) {
            console.error("Erro ao carregar dados da transação:", error);
        }
    });

    form.addEventListener('submit', async (e) => {
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
            
            try {
                await TransactionService.updateTransaction(id, updatedTransaction);
                
                const modal = bootstrap.Modal.getInstance(modalElement);
                modal.hide();

                // Recarrega o conteúdo da página atual
                if (window.location.pathname.includes('historico.html')) {
                    setupHistoricoFilter();
                } else {
                    renderInitialData();
                }
            } catch (error) {
                console.error("Erro ao editar transação:", error);
                alert("Falha ao atualizar a transação. Tente novamente.");
            }
        }
    });
}

// --- HISTÓRICO E FILTROS ---

async function setupHistoricoFilter() {
    const transactions = await TransactionService.getTransactions(); 
    const sortedTransactions = transactions.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    const buscaCategoria = document.getElementById('buscaCategoria');
    
    const categories = getCategories(); 
    
    if(buscaCategoria && buscaCategoria.children.length <= 1) {
         const optionAll = document.createElement('option');
         optionAll.value = '';
         optionAll.textContent = 'Todas as Categorias';
         buscaCategoria.appendChild(optionAll);

         categories.filter(c => c.type === 'despesa').forEach(c => {
             const option = document.createElement('option');
             option.value = c.name;
             option.textContent = c.name;
             buscaCategoria.appendChild(option);
        });
    }

    const filterAndRender = () => {
        const selectedCategory = buscaCategoria.value;
        let filtered = sortedTransactions;
        
        if (selectedCategory) {
            filtered = sortedTransactions.filter(t => t.categoria === selectedCategory);
        }
        
        renderHistorico(filtered);
    };

    // Remove para evitar duplicidade de listeners
    buscaCategoria.removeEventListener('change', filterAndRender);
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
        // Assegura que a data está em formato ISO para evitar problemas de fuso horário
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
                    <i class="bi bi-${t.icon} me-3 fs-5 ${isReceita ? 'text-success' : 'text-danger'}"></i> 
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

function setupHistoricoListeners() {
    document.addEventListener('click', async function(e) {
        const deleteButton = e.target.closest('.delete-btn');
        if (deleteButton) {
            const transactionId = deleteButton.getAttribute('data-id');
            if (confirm('Tem certeza que deseja excluir esta transação?')) {
                
                try {
                    await TransactionService.deleteTransaction(transactionId);
                    
                    // Recarrega o conteúdo da página atual
                    if (window.location.pathname.includes('dashboard.html')) {
                        renderInitialData(); 
                    } else if (window.location.pathname.includes('historico.html')) {
                        setupHistoricoFilter(); 
                    }
                } catch (error) {
                    console.error("Erro ao deletar transação:", error);
                    alert("Falha ao excluir a transação. Tente novamente.");
                }
            }
        }
    });
}

// --- VARIÁVEIS E FUNÇÕES DE GRÁFICOS (Chart.js) ---

let graficoVisaoPeriodoInstance = null;
let graficoReceitasDespesasInstance = null;
let gastosCategoriaChartInstance = null;

async function renderGraficoVisaoPeriodo(periodo) {
    const ctx = document.getElementById('graficoVisaoPeriodo')?.getContext('2d');
    if (!ctx) return;
    
    const transactions = await TransactionService.getTransactions(); 
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
    let ctx = document.getElementById('gastosCategoriaChart')?.getContext('2d');
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
    if (parentNode.querySelector('canvas') && parentNode.querySelector('canvas').style.display === 'none') {
        parentNode.querySelector('canvas').style.display = 'block';
    } else if (!parentNode.querySelector('canvas')) {
         // Se a tela for recriada em run-time
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

async function renderGraficoReceitasDespesas(periodo) {
    const ctx = document.getElementById('graficoReceitasDespesas')?.getContext('2d');
    if (!ctx) return;
    
    const transactions = await TransactionService.getTransactions();
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

// --- RELATÓRIOS ---

async function setupRelatoriosFilter() {
    const transactions = await TransactionService.getTransactions(); 
    
    const toggleContainer = document.getElementById('relatorios-periodo-toggle');
    if(toggleContainer) renderGraficoReceitasDespesas('mes'); // Inicializa o gráfico de receitas/despesas

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

// --- UTILS DE PERFIL E FORMULÁRIO ---

function populateCategorySelect(selectId, selectedCategoryName = '') {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = '<option value="">Selecione...</option>';
    const categories = getCategories();

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        if (category.name === selectedCategoryName) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

function getCurrentDateFormatted() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function updateProfileInfo() {
    if (!currentUser || !currentUser.name) return;

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

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            AuthService.logout();
            window.location.href = 'index.html';
        });
    }
}

function setupProfilePage() {
    const perfilForm = document.getElementById('perfilForm');
    const nomeInput = document.getElementById('perfilNome');
    const emailInput = document.getElementById('perfilEmail');
    
    if (perfilForm) {
        nomeInput.value = currentUser.name || '';
        emailInput.value = currentUser.email || '';

        perfilForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Funcionalidade de atualização de perfil em desenvolvimento.');
        });
    }
}

// --- FUNÇÃO DE INICIALIZAÇÃO PRINCIPAL ---

function initApp() {
    const pathname = window.location.pathname;
    const isAuthenticated = AuthService.getToken();
    
    // 1. Configuração Comum (Disponível em todas as páginas)
    setupLogout();
    setupNovaTransacao();
    setupEditTransacao();
    setupHistoricoListeners(); 

    // 2. Proteção de Rotas
    const protectedPages = ['dashboard.html', 'historico.html', 'perfil.html', 'relatorios.html'];
    const requiresAuth = protectedPages.some(page => pathname.includes(page));

    if (requiresAuth && !isAuthenticated) {
        window.location.href = 'index.html'; 
        return;
    }
    
    // 3. Configuração Específica de Páginas
    // Inicializa Login e Cadastro verificando a presença dos formulários.
    if (document.getElementById('loginForm')) { 
        setupLogin();
    }
    if (document.getElementById('cadastroForm')) { 
        setupCadastro();
    }
    
    if (requiresAuth) {
        // Se a página for protegida E o usuário estiver autenticado:
        updateProfileInfo();

        if (pathname.includes('dashboard.html')) {
            renderInitialData(); 
        } else if (pathname.includes('historico.html')) {
            setupHistoricoFilter(); 
        } else if (pathname.includes('relatorios.html')) {
             setupRelatoriosFilter();
        } else if (pathname.includes('perfil.html')) {
             setupProfilePage();
        }
    }
}

window.onload = initApp;