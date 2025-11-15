from fastapi.testclient import TestClient
from app.main import app
from app import database, models

client = TestClient(app)

def setup_module(module):
    """Limpa o banco antes de cada execução."""
    db = next(database.get_db())
    db.query(models.Transaction).delete()
    db.query(models.User).delete()
    db.commit()
    db.close()

def test_create_transaction():
    # 1️⃣ Registrar um novo usuário
    user_data = {"name": "Nikson", "email": "nikson@example.com", "password": "123456"}
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == 200 or response.status_code == 400

    # 2️⃣ Fazer login para pegar o token JWT
    login_data = {"email": "nikson@example.com", "password": "123456"}
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3️⃣ Criar uma nova transação
    transaction_data = {
        "amount": 100.0,
        "type": "income",
        "category": "Salário",
        "description": "Pagamento mensal",
        "date": "2025-10-20T00:00:00",
        "user_id": 1
    }
    response = client.post("/transactions/", json=transaction_data, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["amount"] == 100.0
    assert data["type"] == "income"
    assert data["category"] == "Salário"
    assert data["description"] == "Pagamento mensal"


def test_get_transactions():

    login_data = {"email": "nikson@example.com", "password": "123456"}
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/transactions/", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "category" in data[0]
    assert data[0]["category"] == "Salário"
    
def test_transaction_summary():

    login_data = {"email": "nikson@example.com", "password": "123456"}
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/transactions/summary/1", headers=headers)
    assert response.status_code == 200
    summary = response.json()
    assert summary["total_income"] >= 100.0
    assert "balance" in summary
    
def test_get_transaction_history():
    """Teste de histórico de transações"""
    login_data = {"email": "nikson@example.com", "password": "123456"}
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200

    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/transactions/history", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if data:
        assert "description" in data[0]
        assert "amount" in data[0]

def test_get_transactions_by_category():
    """Teste de listagem de transações por categoria"""
    login_data = {"email": "nikson@example.com", "password": "123456"}
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200

    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/transactions/by_category/Salário", headers=headers)
    assert response.status_code in [200, 404]
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert data[0]["category"] == "Salário"
