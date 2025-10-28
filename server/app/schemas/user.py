from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    name: str = Field(
        ..., min_length=3, description="Name must be at least 3 characters long"
    )
    email: EmailStr = Field(..., min_length=3, description="Enter a valid email id")
    password: str = Field(
        ..., min_length=8, description="Password must be at least 8 characters long"
    )


class UserDataResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    model_config = {"from_attributes": True}


class UserResponse(BaseModel):
    status: int
    message: str
    data: UserDataResponse


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., min_length=3, description="Invalid email or password")
    password: str = Field(..., min_length=8, description="Invalid email or password")


class LoginDataResponse(BaseModel):
    name: str
    email: str


class LoginResponse(BaseModel):
    status: int
    message: str
    data: LoginDataResponse
