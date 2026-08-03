from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    fullName: str
    email: EmailStr
    password: str
    mobileNumber: Optional[str] = None
    role: str
    employeeId: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    address: Optional[str] = None
    profilePicture: Optional[str] = None

class UserUpdate(BaseModel):
    fullName: Optional[str] = None
    mobileNumber: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    address: Optional[str] = None
    profilePicture: Optional[str] = None

class UserRead(BaseModel):
    id: str
    fullName: str
    email: str
    mobileNumber: Optional[str] = None
    role: str
    employeeId: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    address: Optional[str] = None
    profilePicture: Optional[str] = None
    isActive: bool = True

    class Config:
        from_attributes = True
