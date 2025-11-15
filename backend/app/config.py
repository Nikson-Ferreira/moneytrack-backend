from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DB_HOST: str = "localhost"
    DB_NAME: str = "moneytrack"
    DB_USER: str = "root"
    DB_PASS: str = ""
    SECRET_KEY: str = "chave_super_secreta"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = ".env"

settings = Settings()
