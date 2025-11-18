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

def test_update_user():
    # cria usuário primeiro
    create = client.post("/users/", json={
        "name": "Old Name",
        "email": "old@example.com",
        "password": "123456"
    })
    assert create.status_code == 200

    user_id = create.json()["id"]

    # atualiza usuário
    response = client.put(f"/users/{user_id}", json={
        "name": "New Name",
        "email": "new@example.com",
        "password": "123456"
    })

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "New Name"
    assert data["email"] == "new@example.com"


def test_delete_user(client):
    create = client.post("/users/", json={
        "name": "User Delete",
        "email": "delete@example.com",
        "password": "123456"
    })
    assert create.status_code == 200

    user_id = create.json()["id"]

    response = client.delete(f"/users/{user_id}")
    assert response.status_code == 200
    assert response.json()["message"] == "User deleted successfully"

    login_data = {"email": "delete@example.com", "password": "123456"}
    login_response = client.post("/auth/login", json=login_data)
    assert login_response.status_code in [401, 404]