from fastapi import FastAPI
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from app import database
from app.database import engine
from app import models
from app.routes import auth, transactions, users

# Cria o app principal do FastAPI
app = FastAPI(
    title="MoneyTrack API",
    description="API do sistema de controle financeiro pessoal (MoneyTrack)",
    version="1.0.0"
)

models.Base.metadata.create_all(bind=database.engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Pode restringir depois: ["https://moneytrack-frontend.vercel.app"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

app.include_router(transactions.router)
app.include_router(users.router)
app.include_router(auth.router)

# 🔹 Rota inicial (teste rápido da API)
@app.get("/")
def root():
    return {"message": "🚀 MoneyTrack API online e funcionando!"}

# 🔹 Ponto de entrada para execução local
if __name__ == "__main__":
    import uvicorn
    import os

    port = int(os.environ.get("PORT", 10000))  # Usa a porta que o Render fornecer

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port
    )