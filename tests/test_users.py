from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_users_route():
    """Teste da rota de listagem de usuários"""
    response = client.get("/users/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_user_profile():
    """Teste para obter perfil do usuário autenticado"""
    login_data = {"email": "nikson@example.com", "password": "123456"}
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200

    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/users/profile", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "email" in data
    assert data["email"] == "nikson@example.com"
