from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..core.database import get_db
from ..models.category import Category
from ..schemas.category import (
    CreateCategory,
    CategoryResponse,
    AllCategoryResponse,
    AllCategoryData,
    CategoryDataResponse,
)
from fastapi.responses import JSONResponse

category_router = APIRouter()


@category_router.post("/add_category", response_model=CategoryResponse)
def add_category(category: CreateCategory, db: Session = Depends(get_db)):
    existing_category = (
        db.query(Category)
        .filter(func.lower(Category.name) == category.name.lower())
        .first()
    )

    if existing_category:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "status": status.HTTP_401_UNAUTHORIZED,
                "message": "Category already exists",
            },
        )

    new_category = Category(
        name=category.name,
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    data = CategoryDataResponse.model_validate(new_category)
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": status.HTTP_200_OK,
            "message": "Registered successfully",
            "data": data.model_dump(),
        },
    )


@category_router.get("/all_category", response_model=AllCategoryResponse)
def all_category(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    data = [AllCategoryData.model_validate(cat).model_dump() for cat in categories]
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"status": status.HTTP_200_OK, "message": "Ok", "data": data},
    )
