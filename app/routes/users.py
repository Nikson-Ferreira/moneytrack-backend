from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, database
from typing import List

router = APIRouter(prefix="/users", tags=["Users"])

# ✅ Criar um novo usuário
@router.post("/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Verifica se o email já está cadastrado
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado!")

    new_user = models.User(
        name=user.name,
        email=user.email,
        password=user.password,  # (depois faremos o hash da senha)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# ✅ Listar todos os usuários
@router.get("/", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(database.get_db)):
    users = db.query(models.User).all()
    return users
