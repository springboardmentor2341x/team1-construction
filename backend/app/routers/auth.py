from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserMinimal, ForgotPasswordRequest, ResetPasswordRequest, MessageResponse
from app.schemas.user import UserCreate, UserUpdate, UserRead
from app.services.auth_service import AuthService
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    return auth_service.login(req)

@router.post("/register", response_model=UserMinimal)
def register(req: UserCreate, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    return auth_service.register(req)

@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    return auth_service.forgot_password(req.email)

@router.post("/reset-password", response_model=MessageResponse)
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    return auth_service.reset_password(req.password)

@router.get("/me", response_model=UserRead)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserRead(
        id=current_user.id,
        fullName=current_user.full_name,
        email=current_user.email,
        mobileNumber=current_user.mobile,
        role=current_user.role_rel.name if current_user.role_rel else "Worker",
        employeeId=current_user.employee_id,
        department=current_user.department,
        designation=current_user.designation,
        address=current_user.address,
        profilePicture=current_user.profile_picture,
        isActive=current_user.is_active
    )

profile_router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("", response_model=UserRead)
def get_profile(current_user: User = Depends(get_current_user)):
    return UserRead(
        id=current_user.id,
        fullName=current_user.full_name,
        email=current_user.email,
        mobileNumber=current_user.mobile,
        role=current_user.role_rel.name if current_user.role_rel else "Worker",
        employeeId=current_user.employee_id,
        department=current_user.department,
        designation=current_user.designation,
        address=current_user.address,
        profilePicture=current_user.profile_picture,
        isActive=current_user.is_active
    )

@router.put("", response_model=UserRead)
def update_profile(updates: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_service = UserService(db)
    return user_service.update_profile(current_user.id, updates)
