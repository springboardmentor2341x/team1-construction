from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
import re

# Strong password requirements: at least 8 chars, one uppercase, one lowercase,
# one digit, and one special character.
PASSWORD_PATTERN = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,64}$")

def validate_password_strength(value: str) -> str:
    if not PASSWORD_PATTERN.match(value):
        raise ValueError(
            "Password must be at least 8 characters and include an uppercase letter, "
            "a lowercase letter, a number, and a special character."
        )
    return value

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
    token: str
    password: str
    _validate_password = field_validator("password")(validate_password_strength)

class MessageResponse(BaseModel):
    message: str
    resetToken: Optional[str] = None
