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

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime
import models, schemas, auth, database

app = FastAPI(title="Office Job Workflow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=database.engine)

# --- Pydantic Schemas (Inline for brevity) ---
class UserBase(BaseModel):
    username: str
    role: str = "ops"
    designation: str = "Analyst"
    shift: str = "GEN"

class UserCreate(UserBase):
    password: str

class JobCreate(BaseModel):
    job_no: str
    client_id: int
    currency: str
    client_payout: float
    production_percentage: float
    mandates: int
    pm_comment: str = ""

class AmendCreate(BaseModel):
    job_id: int
    mandate_change: int
    comment: str

class TaskCreate(BaseModel):
    job_id: int
    name: str
    lead_id: int
    assigned_ops_id: int
    facility: str
    estimated_hours: float



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


# --- Admin APIs ---
@app.get("/api/users")
def get_users(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.User).all()


@app.post("/api/users")
def create_user(user: UserCreate, db: Session = Depends(database.get_db),
                current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role not in ["admin", "ceo"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    db_user = models.User(username=user.username, hashed_password=auth.get_password_hash(user.password), role=user.role,
                          designation=user.designation, shift=user.shift)
    db.add(db_user)
    db.commit()
    return {"status": "User created"}


# --- PM APIs ---
@app.post("/api/jobs")
def create_job(job: JobCreate, db: Session = Depends(database.get_db),
               current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != "pm":
        raise HTTPException(status_code=403, detail="Only PMs can create jobs")
    db_job = models.Job(**job.dict(), pm_id=current_user.id)
    db.add(db_job)
    db.commit()
    return {"status": "Job created", "job_id": db_job.id}


@app.get("/api/jobs")
def get_jobs(db: Session = Depends(database.get_db)):
    return db.query(models.Job).all()


@app.post("/api/jobs/amend")
def request_amend(amend: AmendCreate, db: Session = Depends(database.get_db),
                  current_user: models.User = Depends(auth.get_current_user)):
    job = db.query(models.Job).filter(models.Job.id == amend.job_id).first()
    new_version = job.current_version + 1
    db_amend = models.JobVersion(job_id=amend.job_id, version=new_version, mandate_change=amend.mandate_change,
                                 comment=amend.comment, requested_by=current_user.id)
    db.add(db_amend)
    db.commit()
    return {"status": "Amendment requested, pending PM approval"}


@app.post("/api/jobs/amend/approve/{version_id}")
def approve_amend(version_id: int, db: Session = Depends(database.get_db),
                  current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != "pm":
        raise HTTPException(status_code=403, detail="Only PMs can approve")
    version = db.query(models.JobVersion).filter(models.JobVersion.id == version_id).first()
    job = db.query(models.Job).filter(models.Job.id == version.job_id).first()

    version.approved = True
    job.current_version = version.version
    job.mandates += version.mandate_change
    db.commit()
    return {"status": "Approved and version updated"}


# --- Production APIs ---
@app.post("/api/tasks")
def create_task(task: TaskCreate, db: Session = Depends(database.get_db),
                current_user: models.User = Depends(auth.get_current_user)):
    db_task = models.Task(**task.dict())
    db.add(db_task)
    db.commit()
    return {"status": "Task created"}


@app.get("/api/tasks")
def get_tasks(db: Session = Depends(database.get_db)):
    return db.query(models.Task).all()