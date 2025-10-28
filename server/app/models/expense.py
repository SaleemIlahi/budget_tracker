from ..core.database import Base
from sqlalchemy.sql import func
from sqlalchemy import Column, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship


class Expense(Base):

    __tablename__ = "expense"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("category.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    category = relationship("Category")
    user = relationship("User")
