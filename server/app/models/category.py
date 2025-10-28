from ..core.database import Base, engine
from sqlalchemy.sql import func
from sqlalchemy import Column, String, Integer, DateTime


class Category(Base):

    __tablename__ = "category"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
