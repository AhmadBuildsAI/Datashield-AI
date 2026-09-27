from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.database import engine, Base, SessionLocal
from .core.security import hash_password
from .core.logging_config import setup_logging
from .api.routes import auth, scans, analytics

logger = setup_logging()
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(scans.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)


@app.get("/health")
def health():
    return {"status": "healthy", "version": settings.VERSION}


@app.on_event("startup")
def startup():
    from .models.user import User
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            admin = User(
                email="admin@datashield.com",
                password_hash=hash_password("admin123"),
                full_name="Admin User",
            )
            db.add(admin)
            db.commit()
            logger.info("Created default admin user")
    finally:
        db.close()
