from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "DataShield AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "datashield"
    
    SECRET_KEY: str = "datashield-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    MODELS_DIR: str = "/app/ml/models"
    NER_MODEL_PATH: str = "/app/ml/models/distilbert_ner"
    NER_METRICS_PATH: str = "/app/ml/models/metrics.json"
    
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: list = [".txt", ".csv", ".md", ".log"]
    MAX_CHARS: int = 200_000
    
    ENTITY_TYPES: list = [
        "PERSON", "EMAIL", "PHONE", "ADDRESS", "CNIC", "PASSPORT",
        "BANK_ACCOUNT", "CREDIT_CARD", "API_KEY", "PASSWORD",
        "IP_ADDRESS", "ORGANIZATION", "DATE",
    ]
    
    HIGH_RISK_ENTITIES: list = [
        "CNIC", "PASSPORT", "CREDIT_CARD", "BANK_ACCOUNT", "API_KEY", "PASSWORD",
    ]
    MEDIUM_RISK_ENTITIES: list = ["EMAIL", "PHONE", "ADDRESS"]
    LOW_RISK_ENTITIES: list = ["PERSON", "ORGANIZATION", "DATE", "IP_ADDRESS"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
