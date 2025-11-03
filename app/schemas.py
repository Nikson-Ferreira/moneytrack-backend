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
       password: str  
       created_at: datetime 
       
       model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    monthly_income: Optional[float] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
    
class UserLogin(BaseModel):
    email: str
    password: str

# =====================
# TRANSACTION
# =====================
class TransactionBase(BaseModel):
    description: str
    amount: float
    type: str  # "income" ou "expense"
    date: Optional[datetime] = None

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class TransactionResponse(BaseModel):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class TransactionSummary(BaseModel):
    user_id: int
    total_income: float
    total_expenses: float
    balance: float