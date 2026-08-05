from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rbac import RequireRole
from app.models.user import User
from app.schemas.user import UserRead, UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=List[UserRead])
def get_users(
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer", "Contractor"]))
):
    user_service = UserService(db)
    return user_service.get_users(role)

@router.get("/{user_id}", response_model=UserRead)
def get_user_by_id(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_service = UserService(db)
    user = user_service.user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserRead(
        id=user.id,
        fullName=user.full_name,
        email=user.email,
        mobileNumber=user.mobile,
        role=user.role_rel.name if user.role_rel else "Worker",
        employeeId=user.employee_id,
        department=user.department,
        designation=user.designation,
        address=user.address,
        profilePicture=user.profile_picture,
        isActive=user.is_active
    )

@router.put("/{user_id}", response_model=UserRead)
def update_user(user_id: str, updates: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_service = UserService(db)
    return user_service.update_profile(user_id, updates)

@router.patch("/{user_id}/status", response_model=UserRead)
def toggle_user_status(user_id: str, active: bool, db: Session = Depends(get_db), current_user: User = Depends(RequireRole(["Administrator"]))):
    user_service = UserService(db)
    user = user_service.user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = active
    updated = user_service.user_repo.update(user)
    return UserRead(
        id=updated.id,
        fullName=updated.full_name,
        email=updated.email,
        mobileNumber=updated.mobile,
        role=updated.role_rel.name if updated.role_rel else "Worker",
        employeeId=updated.employee_id,
        department=updated.department,
        designation=updated.designation,
        address=updated.address,
        profilePicture=updated.profile_picture,
        isActive=updated.is_active
    )
