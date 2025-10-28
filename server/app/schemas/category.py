from pydantic import BaseModel, Field
from typing import List


class CreateCategory(BaseModel):
    name: str = Field(
        ..., min_length=3, description="Name must be at least 3 characters long"
    )


class CategoryDataResponse(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class CategoryResponse(BaseModel):
    status: int
    message: str
    data: CategoryDataResponse


class AllCategoryData(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class AllCategoryResponse(BaseModel):
    status: int
    message: str
    data: List[AllCategoryData]
