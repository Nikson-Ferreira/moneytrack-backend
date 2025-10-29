from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr


# Esquema para criação de usuário (entrada de dados)
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    monthly_income: Optional[float] = None

# Esquema para resposta (saída de dados)
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    monthly_income: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True 

# --- Schema base de transação ---
class TransactionBase(BaseModel):
    description: str
    amount: float
    type: str

# --- Para criação ---
class TransactionCreate(TransactionBase):
    user_id: int
    
# --- Para resposta ---
class Transaction(TransactionBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str