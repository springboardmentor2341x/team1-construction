from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserRead, UserUpdate
from app.repositories.user_repository import UserRepository

class UserService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)

    def get_users(self, role: Optional[str] = None) -> List[UserRead]:
        users = self.user_repo.get_all(role_name=role)
        return [
            UserRead(
                id=u.id,
                fullName=u.full_name,
                email=u.email,
                mobileNumber=u.mobile,
                role=u.role_rel.name if u.role_rel else "Worker",
                employeeId=u.employee_id,
                department=u.department,
                designation=u.designation,
                address=u.address,
                profilePicture=u.profile_picture,
                isActive=u.is_active
            ) for u in users
        ]

    def update_profile(self, user_id: str, updates: UserUpdate) -> UserRead:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        if updates.fullName is not None: user.full_name = updates.fullName
        if updates.mobileNumber is not None: user.mobile = updates.mobileNumber
        if updates.department is not None: user.department = updates.department
        if updates.designation is not None: user.designation = updates.designation
        if updates.address is not None: user.address = updates.address
        if updates.profilePicture is not None: user.profile_picture = updates.profilePicture

        updated = self.user_repo.update(user)
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
