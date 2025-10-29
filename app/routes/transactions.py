from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, database

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/", response_model=schemas.Transaction)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.id == transaction.user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db_transaction = models.Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


@router.get("/", response_model=list[schemas.Transaction])
def get_transactions(db: Session = Depends(database.get_db)):
    return db.query(models.Transaction).all()

router = APIRouter()

get_db = database.get_db

# ✅ 1. Filtrar transações por usuário
@router.get("/transactions/user/{user_id}", response_model=list[schemas.Transaction])
def get_transactions_by_user(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.Transaction).filter(models.Transaction.user_id == user_id).all()

# ✅ 2. Resumo financeiro do usuário
@router.get("/transactions/summary/{user_id}")
def get_transaction_summary(user_id: int, db: Session = Depends(get_db)):
    transactions = db.query(models.Transaction).filter(models.Transaction.user_id == user_id).all()

    total_income = sum(t.amount for t in transactions if t.type == "income")
    total_expenses = sum(t.amount for t in transactions if t.type == "expense")
    balance = total_income - total_expenses

    return {
        "user_id": user_id,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "balance": balance
    }