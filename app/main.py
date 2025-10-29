from fastapi import FastAPI
from app.database import engine
from app import models
from app.routes import auth, transactions, users

# Cria o app principal do FastAPI
app = FastAPI(title="MoneyTrack API", version="1.0")

# Cria as tabelas no banco (com base nos models)
models.Base.metadata.create_all(bind=engine)

# Rota inicial (teste)
@app.get("/")
def home():
    return {"message": "🚀 MoneyTrack API rodando com sucesso!"}

app.include_router(transactions.router)
app.include_router(users.router)
app.include_router(auth.router)