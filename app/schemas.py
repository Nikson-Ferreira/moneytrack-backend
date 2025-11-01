from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

# =====================
# USER
# =====================

class User(BaseModel):
       id: int
       name: str
       email: str
       password: str  # Ou omita se não quiser expor
       created_at: datetime  # Se usar datetime
       
       model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):# Esquema para criação de usuário
    name: str
    email: EmailStr
    password: str
    monthly_income: Optional[float] = None

# Esquema para resposta (saída de dados)
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# =====================
# TRANSACTION
# =====================
class TransactionBase(BaseModel):
    description: str
    amount: float
    type: str  # entrada ou saida
    date: Optional[datetime] = None

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
    
class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(BaseModel):
    id: int
    created_at: Optional[datetime] = None 
    
    model_config = ConfigDict(from_attributes=True)
         
class TransactionSummary(BaseModel):
    user_id: int
    total_income: float
    total_expenses: float
    balance: float