from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, oauth2, schemas, database
from typing import List
from app.database import get_db

router = APIRouter(prefix="/users", tags=["Users"])

# Criar um novo usuário
@router.post("/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):

    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado!")

    new_user = models.User(
        name=user.name,
        email=user.email,
        password=user.password,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/", response_model=list[schemas.UserResponse])
def get_users(db: Session = Depends(database.get_db)):
    return db.query(models.User).all()

# 🔹 Rota de perfil do usuário autenticado
@router.get("/profile", response_model=schemas.UserResponse)
def get_user_profile(current_user: models.User = Depends(oauth2.get_current_user)):
    if not current_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return current_user

@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: int,
    updated_data: schemas.UserUpdate,
    db: Session = Depends(database.get_db),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    # CORRIGIDO: Substituir .dict() por .model_dump()
    for attr, value in updated_data.model_dump(exclude_unset=True).items(): 
        setattr(user, attr, value)

    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}