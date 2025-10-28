from fastapi import Response, Request


def set_cookie(response: Response, key: str, token: str, max_age: int, path: str = "/"):
    response.set_cookie(
        key=key,
        value=token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=max_age,
        path=path,
    )


def delete_cookie(response: Response, key: str, path: str = "/"):
    response.delete_cookie(key, path=path)


def get_cookie(request: Request, key: str):
    return request.cookies.get(key)
