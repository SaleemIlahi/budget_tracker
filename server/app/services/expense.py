from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.expense import Expense
from ..models.category import Category
from ..schemas.expense import (
    AddTransaction,
    AddTransactionResponse,
    AllData,
    AllDataResponse,
    CategoryDataResponse,
    CategoryData,
    DateData,
    DateDataResponse,
    FilterData,
    FilterDataResponse,
)
from fastapi.responses import JSONResponse
from sqlalchemy import func
from fastapi import Query
from datetime import date

expense_router = APIRouter()


@expense_router.post("/add_expense", response_model=AddTransactionResponse)
def add_expense(data: AddTransaction, db: Session = Depends(get_db)):
    new_expense = Expense(
        category_id=data.category_id,
        user_id=data.user_id,
        description=data.description,
        amount=data.amount,
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": status.HTTP_200_OK,
            "message": "Add successfully",
        },
    )


@expense_router.get("/all", response_model=AllDataResponse)
def all_transaction(request: Request, db: Session = Depends(get_db)):
    user_id = int(request.state.user["sub"])

    all = (
        db.query(
            Expense.id,
            Expense.amount,
            Expense.description,
            Expense.created_at,
            Expense.updated_at,
            Category.name.label("name"),
        )
        .join(Category, Expense.category_id == Category.id)
        .where((Expense.user_id == user_id) & (Category.name != "income"))
    )
    data = [AllData.model_validate(exp).model_dump(mode="json") for exp in all]
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": status.HTTP_200_OK,
            "message": "Add successfully",
            "data": data,
        },
    )


@expense_router.get("/category_wise", response_model=CategoryDataResponse)
def category_wise(request: Request, db: Session = Depends(get_db)):
    user_id = int(request.state.user["sub"])

    all = (
        db.query(
            Category.name.label("name"),
            func.sum(Expense.amount).label("total"),
        )
        .join(Category, Expense.category_id == Category.id)
        .where((Expense.user_id == user_id))
        .group_by(Category.name)
    )

    data = [CategoryData.model_validate(exp).model_dump() for exp in all]
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": status.HTTP_200_OK,
            "message": "Ok",
            "data": data,
        },
    )


@expense_router.get("/date_wise", response_model=DateDataResponse)
def date_wise(request: Request, db: Session = Depends(get_db), q: str = Query(None)):
    user_id = int(request.state.user["sub"])
    query = (
        db.query(
            func.date(Expense.created_at).label("date"),
            func.sum(Expense.amount).label("amount"),
        )
        .join(Category, Expense.category_id == Category.id)
        .filter(Expense.user_id == user_id)
    )

    if q == "income":
        query = query.filter(Category.name == "income")
    else:
        query = query.filter(Category.name != "income")

    all = query.group_by(func.date(Expense.created_at)).order_by(
        func.date(Expense.created_at)
    )

    data = [DateData.model_validate(exp).model_dump(mode="json") for exp in all]
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": status.HTTP_200_OK,
            "message": "Ok",
            "data": data,
        },
    )


@expense_router.get("/filter", response_model=FilterDataResponse)
def table_filter(
    request: Request,
    db: Session = Depends(get_db),
    sdate: date = Query(None),
    edate: date = Query(None),
    amount: int = Query(None),
    category: int = Query(None),
):
    user_id = int(request.state.user["sub"])
    query = (
        db.query(
            func.date(Expense.created_at).label("date"),
            Expense.amount.label("amount"),
            Category.name.label("name"),
        )
        .join(Category, Expense.category_id == Category.id)
        .filter(Expense.user_id == user_id)
    )

    if sdate and edate:
        query = query.filter(Expense.created_at.between(sdate, edate))

    if amount is not None:
        query = query.filter(Expense.amount == amount)

    if category is not None:
        query = query.filter(Category.id == category)

    data = [FilterData.model_validate(exp).model_dump(mode="json") for exp in query]
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": status.HTTP_200_OK,
            "message": "Ok",
            "data": data,
        },
    )
