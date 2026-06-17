# api/index.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
import models, auth, database

app = FastAPI(title="Office Job Workflow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on cold start
models.Base.metadata.create_all(bind=database.engine)

@app.on_event("startup")
def init_db():
    db = database.SessionLocal()
    if not db.query(models.User).first():
        users = [
            models.User(username="ceo", hashed_password=auth.get_password_hash("pass"), role="ceo", designation="CEO"),
            models.User(username="pm", hashed_password=auth.get_password_hash("pass"), role="pm", designation="Project Manager"),
            models.User(username="admin", hashed_password=auth.get_password_hash("pass"), role="admin", designation="Admin"),
            models.User(username="lead", hashed_password=auth.get_password_hash("pass"), role="lead", shift="APAC", designation="Team Lead"),
            models.User(username="ops1", hashed_password=auth.get_password_hash("pass"), role="ops", shift="GEN", designation="Ops")
        ]
        db.add_all(users)
        db.commit()
    if not db.query(models.Client).first():
        clients = [models.Client(name="Google"), models.Client(name="Microsoft")]
        db.add_all(clients)
        db.commit()
    db.close()

# Change the token route to /api/token to match vercel.json routing
@app.post("/api/token")
def login(form_data: auth.OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@app.get("/api/me")
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# ... (Include all other API routes from main.py here, ensuring they start with /api/ ...)