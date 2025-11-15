from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_user():
    data = {
        "name": "Teste User",
        "email": "teste@example.com",
        "password": "123456"
    }
    response = client.post("/auth/register", json=data)
    assert response.status_code in [200, 400]
    assert "message" in response.json() or "detail" in response.json()

def test_register_duplicate_user():
    data = {
        "name": "Teste Duplicado",
        "email": "teste@example.com",
        "password": "123456"
    }
    response = client.post("/auth/register", json=data)
    assert response.status_code == 400
    assert response.json()["detail"] == "Email já cadastrado"

def test_login_user():
    data = {"email": "teste@example.com", "password": "123456"}
    response = client.post("/auth/login", json=data)
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_invalid_password():
    data = {"email": "teste@example.com", "password": "senhaerrada"}
    response = client.post("/auth/login", json=data)
    assert response.status_code == 400
    assert response.json()["detail"] == "Senha incorreta"

def test_login_invalid_user():
    data = {"email": "naoexiste@example.com", "password": "123456"}
    response = client.post("/auth/login", json=data)
    assert response.status_code == 404
    assert response.json()["detail"] == "Usuário não encontrado"

def test_login_schema_valid():
    data = {"email": "teste_schema@example.com", "password": "123456"}
    response = client.post("/auth/login", json=data)
    assert response.status_code in [200, 400, 404]
