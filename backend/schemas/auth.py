from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "Client"
    department: str | None = None
    employee_id: str | None = None
    mobile: str | None = None
    address: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    full_name: str


class TokenData(BaseModel):
    id: int
    email: str
    role: str
