💰 MoneyTrack – Sistema de Controle Financeiro Pessoal

O MoneyTrack é um sistema desenvolvido para auxiliar no controle financeiro pessoal, permitindo que o usuário registre receitas e despesas, visualize seu histórico de movimentações e acompanhe seu saldo de forma simples e organizada.

🎯 Objetivo do Projeto

Facilitar a organização financeira de forma prática, permitindo que qualquer pessoa acompanhe seus gastos, identifique hábitos de consumo e tome decisões melhores sobre seu dinheiro.

🚀 Funcionalidades

Cadastro de usuários e autenticação via JWT

Registro de receitas e despesas

Histórico completo de transações financeiras

Resumo financeiro (total de receitas, despesas e saldo)

Integração com banco de dados SQLite

Documentação automática via Swagger UI

Testes automatizados (TDD) com Pytest

Deploy do backend na nuvem (Render)

Frontend desenvolvido em Kotlin (Android)

Protótipo visual no Figma

🧰 Tecnologias Utilizadas
Camada	Tecnologia
Frontend	Kotlin + Jetpack Compose
Backend	Python + FastAPI
Banco de Dados	SQLite
Design	Figma
Arquitetura	MVVM
Versionamento	Git + GitHub
Deploy	Render Cloud
Testes	Pytest + TDD
📌 Status do Projeto

✅ Checkpoint 1 – Documentação inicial
✅ Checkpoint 2 – Protótipo no Figma + Casos de uso
✅ Checkpoint 3 – Backend com FastAPI + Banco de Dados + Testes TDD + Deploy Render
⬜ Integração frontend/backend
⬜ Versão final com relatórios e gráficos

👨‍💻 Equipe

Projeto desenvolvido em equipe na disciplina Projeto de Software (Uniube):

🧑‍💻 Nikson Ferreira de Lima – RA: 5163006

👩‍💻 Rafaella Costa Barbosa – RA: 5162833

👩‍💻 Joana Vivian Rodrigues Lemos – RA: 5163208

👨‍💻 Guilherme Antônio de Souza – RA: 1173003

🎨 Protótipo no Figma

🔗 Protótipo navegável do MoneyTrack (Figma)
 (adicione o link real aqui)

📚 Documentação

A documentação do projeto inclui:

Escopo do sistema

Requisitos funcionais e não funcionais

Modelagem de casos de uso

Diagramas UML (casos de uso, classes e sequência)

Metodologia SCRUM aplicada

Roteiro de testes automatizados (TDD)

☁️ Deploy na Nuvem (Render)

A API está hospedada na Render Cloud e pode ser acessada pelo link abaixo:

🔗 https://moneytrack-backend.onrender.com

A rota inicial (/) retorna:

{"message": "🚀 MoneyTrack API online e funcionando!"}


Documentação interativa (Swagger UI):
👉 https://moneytrack-backend.onrender.com/docs

⚙️ Como rodar o backend localmente
🧩 1. Clonar o repositório
git clone https://github.com/Nikson-Ferreira/moneytrack.git
cd moneytrack

🐍 2. Criar e ativar o ambiente virtual
python -m venv venv


Ativar:

Windows (PowerShell):

venv\Scripts\activate


Linux/Mac:

source venv/bin/activate

📦 3. Instalar as dependências
pip install -r requirements.txt


Caso não exista o arquivo requirements.txt, instale manualmente:

pip install fastapi uvicorn sqlalchemy python-jose passlib[bcrypt] pydantic-settings pytest

🗄️ 4. Banco de Dados

O projeto utiliza SQLite por padrão, criando automaticamente o arquivo moneytrack.db na raiz ao rodar o servidor.

▶️ 5. Executar o servidor localmente
uvicorn app.main:app --reload


Acesse a aplicação em:
🔗 http://127.0.0.1:8000

🧠 Testar as rotas

Acesse o Swagger UI:
👉 http://127.0.0.1:8000/docs

Principais rotas:

Método	Rota	Descrição
| Método | Rota                              | Descrição                    |
| ------ | --------------------------------- | ---------------------------- |
| `POST` | `/auth/register`                  | Cadastrar usuário            |
| `POST` | `/auth/login`                     | Login e geração de token JWT |
| `GET`  | `/transactions/`                  | Listar transações do usuário |
| `POST` | `/transactions/`                  | Criar nova transação         |
| `GET`  | `/transactions/summary/{user_id}` | Ver resumo financeiro        |
| `GET`  | `/users/`                         | Listar todos os usuários     |


Os testes utilizam Pytest para validar:

Cadastro e login de usuários

Autenticação com JWT

Criação e listagem de transações

Resumo de transações

Rodar os testes:

pytest -v

🧩 Estrutura do Projeto
moneytrack/
│
├── app/
│   ├── main.py              # Arquivo principal da aplicação
│   ├── models.py            # Modelos do banco de dados
│   ├── schemas.py           # Esquemas Pydantic (entrada e saída de dados)
│   ├── database.py          # Conexão e configuração do banco
│   └── routes/              # Rotas principais (auth, users, transactions)
│
├── tests/                   # Testes automatizados (TDD)
│   ├── test_auth.py
│   ├── test_transactions.py
│   └── test_users.py
│
├── requirements.txt
└── README.md


✅ Principais Resultados

Backend 100% funcional com autenticação, CRUD e testes TDD

API deployada na nuvem (Render)

Swagger UI documentando todas as rotas

Integração futura com o aplicativo Android em Kotlin

💬 Observações Finais

O MoneyTrack foi projetado com foco em simplicidade, segurança e escalabilidade.
Com o backend consolidado e testado, o próximo passo é integrar a aplicação Android e gerar relatórios financeiros visuais.