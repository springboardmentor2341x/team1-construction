from pydantic import BaseModel, EmailStr
from typing import Optional

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    rememberMe: Optional[bool] = True

class UserMinimal(BaseModel):
    id: str
    fullName: str
    email: str
    role: str
    profilePicture: Optional[str] = None
    employeeId: Optional[str] = None
    department: Optional[str] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    token: str
    user: UserMinimal

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    password: str

class MessageResponse(BaseModel):
    message: str
