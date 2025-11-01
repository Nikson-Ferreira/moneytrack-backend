from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_users_route():
    """Teste da rota de listagem de usuários"""
    response = client.get("/users/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
