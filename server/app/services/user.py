from fastapi import APIRouter, Depends, status, Request, Response
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.user import User
from ..utils.password import get_password_hash, verify_password
from ..schemas.user import (
    UserCreate,
    UserResponse,
    LoginResponse,
    LoginRequest,
    UserDataResponse,
)
from ..utils.token import create_access_token, create_refresh_token, verify_token
from ..utils.session import get_cookie, set_cookie, delete_cookie
from fastapi.responses import JSONResponse

router = APIRouter()


@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "status": status.HTTP_401_UNAUTHORIZED,
                "message": "Email already registered",
            },
        )

    if len(user.password) < 8:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "status": status.HTTP_401_UNAUTHORIZED,
                "message": "Password must be at least 8 characters long",
            },
        )

    password_hash = get_password_hash(user.password)

    new_user = User(name=user.name, email=user.email, password=password_hash)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    data = UserDataResponse.model_validate(new_user)

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": status.HTTP_200_OK,
            "message": "Registered successfully",
            "data": data.model_dump(),
        },
    )


@router.post("/login", response_model=LoginResponse)
def login(user: LoginRequest, db: Session = Depends(get_db)):
    email = user.email
    password = user.password

    check_user = db.query(User).filter(User.email == email).first()

    if not check_user:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "status": status.HTTP_401_UNAUTHORIZED,
                "message": "Invalid email or password",
            },
        )

    match_password = verify_password(password, check_user.password)

    if not match_password:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "status": status.HTTP_401_UNAUTHORIZED,
                "message": "Invalid email or password",
            },
        )

    db_id = str(check_user.id)
    db_name = check_user.name
    access_token = create_access_token({"sub": db_id})
    refresh_token = create_refresh_token({"sub": db_id})

    check_user.refresh_token = refresh_token
    db.commit()

    data = {"name": db_name, "email": email}

    response = JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": status.HTTP_200_OK,
            "message": "Login successfully",
            "data": data,
        },
    )

    set_cookie(response, "accessToken", access_token, max_age=15 * 60)
    set_cookie(
        response,
        "refreshToken",
        refresh_token,
        max_age=7 * 24 * 60 * 60,
        path="/auth/refresh",
    )
    return response


@router.post("/refresh")
def refresh_token(request: Request, response: Response):
    refresh_token = get_cookie(request, "refreshToken")
    if not refresh_token:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "status": status.HTTP_401_UNAUTHORIZED,
                "message": "UNAUTHORIZED __001",
            },
        )

    payload = verify_token(refresh_token, is_refresh=True)
    if not payload:
        delete_cookie(response, "refreshToken", path="/refresh")
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "status": status.HTTP_401_UNAUTHORIZED,
                "message": "UNAUTHORIZED __002",
            },
        )

    new_access_token = create_access_token({"sub": str(payload["id"])})
    set_cookie(response, "accessToken", new_access_token, max_age=15 * 60)
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"status": status.HTTP_200_OK, "message": "Access token refreshed"},
    )


@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refreshToken")

    if refresh_token:
        try:
            payload = verify_token(refresh_token)
            user_id = payload.get("sub")

            if user_id:
                user = db.query(User).filter(User.id == user_id).first()
                if user:
                    user.refresh_token = None
                    db.commit()
        except Exception:
            pass
    delete_cookie(response, "refreshToken", path="/refresh")
    delete_cookie(response, "accessToken")
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"status": status.HTTP_200_OK, "message": "Logout successfully"},
    )
