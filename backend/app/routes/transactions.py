from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, oauth2, schemas, database
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.oauth2 import get_current_user
from app.database import get_db

router = APIRouter(prefix="/transactions", tags=["Transactions"])

get_db = database.get_db

# ✅ Criar nova transação
@router.post("/", response_model=schemas.Transaction, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    db_user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    db_transaction = models.Transaction(**transaction.model_dump(), user_id=current_user.id)
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


# ✅ Listar todas as transações do usuário logado
@router.get("/", response_model=list[schemas.Transaction])
def get_transactions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
    start_date: str = None,
    end_date: str = None,
    type: str = None
):
    query = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id)
    
    if type:
        query = query.filter(models.Transaction.type == type)
    if start_date:
        query = query.filter(models.Transaction.date >= start_date)
    if end_date:
        query = query.filter(models.Transaction.date <= end_date)

    return query.order_by(models.Transaction.date.desc()).all()



# ✅ Filtrar transações por ID de usuário (rota administrativa)
@router.get("/user/{user_id}", response_model=list[schemas.Transaction])
def get_transactions_by_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    transactions = db.query(models.Transaction).filter(models.Transaction.user_id == user_id).all()
    return transactions


#Obter resumo financeiro (entradas, saídas, saldo)
@router.get("/summary", response_model=dict)
def get_summary(db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    transactions = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id).all()
    income = sum(t.amount for t in transactions if t.type == "income")
    expense = sum(t.amount for t in transactions if t.type == "expense")
    balance = income - expense
    
    return {
        "total_income": income, 
        "total_expense": expense, 
        "balance": balance
    }

    
@router.get("/summary", response_model=dict)
def get_summary(db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    transactions = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id).all()
    income = sum(t.amount for t in transactions if t.type == "income")
    expense = sum(t.amount for t in transactions if t.type == "expense")
    balance = income - expense
    return {"income": income, "expense": expense, "balance": balance}

# 🔹 Histórico detalhado das transações do usuário logado
@router.get("/history", response_model=list[schemas.Transaction])
def get_transaction_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    transactions = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    ).order_by(models.Transaction.date.desc()).all()

    if not transactions:
        raise HTTPException(status_code=404, detail="Nenhuma transação encontrada")

    return transactions

@router.get("/{transaction_id}", response_model=schemas.Transaction)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id
    ).first()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transação não encontrada")

    return transaction


@router.put("/{transaction_id}", response_model=schemas.Transaction, status_code=status.HTTP_200_OK)
def update_transaction(
    transaction_id: int,
    updated_data: schemas.TransactionUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    tr = (
        db.query(models.Transaction)
        .filter(
            models.Transaction.id == transaction_id,
            models.Transaction.user_id == current_user.id
        )
        .first()
    )

    if not tr:
        raise HTTPException(status_code=404, detail="Transação não encontrada")

    for attr, value in updated_data.model_dump(exclude_unset=True).items():
        setattr(tr, attr, value)

    db.commit()
    db.refresh(tr)
    return tr


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    tr_query = (
        db.query(models.Transaction)
        .filter(
            models.Transaction.id == transaction_id,
            models.Transaction.user_id == current_user.id
        )
    )
    tr = tr_query.first()

    if not tr:
        raise HTTPException(status_code=404, detail="Transação não encontrada")

    tr_query.delete(synchronize_session=False)
    db.commit()
    return