from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class AddTransaction(BaseModel):
    category_id: int = Field(..., gt=0, description="Select a valid category")
    user_id: int = Field(..., gt=0, description="Internal Error")
    description: Optional[str] = (
        Field(
            ...,
            min_length=5,
            description="Description must be at least 5 characters long",
        ),
    )
    amount: int = Field(..., gt=0, description="Enter a valid amount")


class AddTransactionResponse(BaseModel):
    status: int
    message: str

    model_config = {"from_attributes": True}


class AllData(BaseModel):
    id: int
    name: str
    amount: int
    description: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


class AllDataResponse(BaseModel):
    status: int
    message: str
    data: List[AllData]


class CategoryData(BaseModel):
    name: str
    total: float

    model_config = {"from_attributes": True}


class CategoryDataResponse(BaseModel):
    status: int
    message: str
    data: List[CategoryData]


class DateData(BaseModel):
    date: datetime
    amount: float

    model_config = {"from_attributes": True}


class DateDataResponse(BaseModel):
    status: int
    message: str
    data: List[DateData]


class FilterData(BaseModel):
    date: datetime
    amount: float
    name: str

    model_config = {"from_attributes": True}


class FilterDataResponse(BaseModel):
    status: int
    message: str
    data: List[FilterData]
