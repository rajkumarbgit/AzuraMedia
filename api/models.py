from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="ops") # ceo, pm, lead, ops, admin
    designation = Column(String)
    shift = Column(String, default="GEN") # APAC, EMEA, AMER, GEN
    is_active = Column(Boolean, default=True)

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)

class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    job_no = Column(String, unique=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    pm_id = Column(Integer, ForeignKey("users.id"))
    currency = Column(String, default="USD")
    client_payout = Column(Float)
    production_percentage = Column(Float)
    mandates = Column(Integer)
    current_version = Column(Integer, default=1)
    status = Column(String, default="Created") # Created, In Progress, Completed
    pm_comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class JobVersion(Base):
    __tablename__ = "job_versions"
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    version = Column(Integer)
    mandate_change = Column(Integer)
    comment = Column(Text)
    requested_by = Column(Integer, ForeignKey("users.id"))
    approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    name = Column(String)
    lead_id = Column(Integer, ForeignKey("users.id"))
    assigned_ops_id = Column(Integer, ForeignKey("users.id"))
    facility = Column(String)
    estimated_hours = Column(Float)
    status = Column(String, default="Pending")

class Leave(Base):
    __tablename__ = "leaves"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(DateTime)
    marked_by = Column(Integer, ForeignKey("users.id"))

class EODComment(Base):
    __tablename__ = "eod_comments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(DateTime)
    comment = Column(Text)