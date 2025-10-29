# 💰 MoneyTrack – Sistema de Controle Financeiro Pessoal

O **MoneyTrack** é um sistema desenvolvido para auxiliar no controle financeiro pessoal, permitindo que o usuário registre receitas e despesas, visualize seu histórico de movimentações e acompanhe seu saldo de forma simples e organizada.

---

## ✅ Objetivo do Projeto
Facilitar a organização financeira de forma prática, permitindo que qualquer pessoa acompanhe seus gastos, identifique hábitos de consumo e tome decisões melhores sobre seu dinheiro.

---

## 🚀 Funcionalidades
- Cadastro de **receitas** e **despesas**
- Histórico de transações
- Categorização financeira
- Exibição de saldo total
- Interface mobile amigável (Android)
- Protótipo visual no Figma
- Backend com API REST em FastAPI

---

## 🛠️ Tecnologias Utilizadas
| Camada     | Tecnologia               |
|------------|--------------------------|
| Frontend   | Kotlin + Jetpack Compose |
| Backend    | Python + FastAPI         |
| Banco de Dados | SQLite               |
| Design     | Figma                    |
| Arquitetura | MVVM                    |
| Versionamento | Git + GitHub          |

---

## 📌 Status do Projeto
✅ Checkpoint 1 – Documentação inicial  
✅ Checkpoint 2 – Protótipo no Figma + Casos de uso  
✅ Checkpoint 3 – Início do backend com FastAPI  
⬜ Integração frontend/backend  
⬜ Testes  
⬜ Deploy final  

---

## 👨‍💻 Equipe
Projeto desenvolvido em equipe na disciplina de **Projeto de Software**:
- Nikson Ferreira de Lima / RA: 5163006
- Rafaella Costa Barbosa / RA: 5162833
- Joana Vivian Rodrigues Lemos / RA: 5163208
- Guilherme Antônio de Souza  / RA: 1173003

---

## 🎨 Protótipo no Figma
🔗 [Protótipo navegável](https://www.figma.com/file/SEU-LINK-AQUI)

---

## 📂 Documentação
A documentação do projeto inclui:
- Escopo do sistema
- Requisitos funcionais e não funcionais
- Modelagem de casos de uso
- Diagramas UML
- Metodologia SCRUM aplicada

---

## 🛠️ Como rodar o backend localmente

Siga os passos abaixo para executar o projeto MoneyTrack na sua máquina.

🧩 1. Clonar o repositório
git clone https://github.com/Nikson-Ferreira/moneytrack.git
cd moneytrack

🐍 2. Criar e ativar o ambiente virtual

No terminal, execute:

python -m venv venv


Ative o ambiente virtual:

Windows (PowerShell):

venv\Scripts\activate


Linux/Mac:

source venv/bin/activate

📦 3. Instalar as dependências
pip install -r requirements.txt


Se não existir o arquivo requirements.txt, instale manualmente:

pip install fastapi uvicorn sqlalchemy pymysql python-jose passlib[bcrypt] pydantic-settings

🗄️ 4. Configurar o banco de dados

Crie um arquivo .env na raiz do projeto (caso não exista) e adicione as variáveis do banco:

DB_USER=seu_usuario
DB_PASS=sua_senha
DB_HOST=localhost
DB_NAME=moneytrack_db


💡 Caso esteja usando SQLite (padrão), o projeto criará automaticamente o arquivo moneytrack.db ao rodar.

⚙️ 5. Rodar as migrações (opcional)

Se estiver usando MySQL ou PostgreSQL:

alembic upgrade head


Para SQLite, este passo pode ser ignorado.

▶️ 6. Executar o servidor

Inicie a aplicação com:

uvicorn app.main:app --reload


A aplicação ficará disponível em:
🔗 http://127.0.0.1:8000

🧠 7. Testar as rotas

Acesse a documentação interativa (Swagger UI):
👉 http://127.0.0.1:8000/docs

Lá você pode:

Criar usuários (POST /auth/register)

Fazer login (POST /auth/login)

Gerar e testar tokens JWT

Registrar e consultar transações

✅ 8. Encerrando o servidor

Pressione CTRL + C no terminal para parar o servidor.
