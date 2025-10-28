from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
import os
from app.services.user import router
from app.services.category import category_router
from app.services.expense import expense_router
from app.core.database import Base, engine
from jose import jwt, JWTError
from fastapi.responses import JSONResponse

app = FastAPI()

frontend_origin = os.getenv("CORS_ORIGIN")
allowed_methods = os.getenv("CORS_METHODS").split(",")
cors_header = os.getenv("CORS_HEADERS").split(",")
ACCESS_SECRET_KEY = os.getenv("ACCESS_SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_credentials=True,
    allow_methods=allowed_methods,
    allow_headers=cors_header,
)


@app.middleware("http")
async def jwt_middleware(request: Request, call_next):
    # Allow public routes if needed
    PUBLIC_PATHS = ["/api/v1/login", "/api/v1/register"]

    if request.url.path in PUBLIC_PATHS:
        return await call_next(request)

    token = request.cookies.get("accessToken")
    if not token:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "status": status.HTTP_401_UNAUTHORIZED,
                "message": "HTTP_401_UNAUTHORIZED __003",
            },
        )

    try:
        payload = jwt.decode(token, ACCESS_SECRET_KEY, algorithms=[ALGORITHM])
        request.state.user = payload
    except JWTError:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "status": status.HTTP_401_UNAUTHORIZED,
                "message": "HTTP_401_UNAUTHORIZED __004",
            },
        )

    return await call_next(request)


Base.metadata.create_all(bind=engine)

app.include_router(router, prefix="/api/v1", tags=["auth"])
app.include_router(category_router, prefix="/api/v1", tags=["category"])
app.include_router(expense_router, prefix="/api/v1", tags=["expense"])
