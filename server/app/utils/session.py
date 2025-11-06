from fastapi import Response, Request
from dotenv import load_dotenv
import os

load_dotenv()

APP_ENV = os.getenv("APP_ENV")


def set_cookie(response: Response, key: str, token: str, max_age: int, path: str = "/"):
    response.set_cookie(
        key=key,
        value=token,
        httponly=True,
        secure=True,
        samesite="None" if APP_ENV == "DEVELOPMENT" else "lax",
        max_age=max_age,
        path=path,
    )


def delete_cookie(response: Response, key: str, path: str = "/"):
    response.delete_cookie(key, path=path)


def get_cookie(request: Request, key: str):
    return request.cookies.get(key)
