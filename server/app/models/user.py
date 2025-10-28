from ..core.database import Base
from sqlalchemy.sql import func
from sqlalchemy import Column, String, Integer, DateTime, Text


class User(Base):

    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    email = Column(String(50), nullable=False)
    password = Column(String(255), nullable=False)
    refresh_token = Column(Text, nullable=True)
    access_token = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
