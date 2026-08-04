from typing import Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.role import Role
from app.schemas.auth import LoginRequest, TokenResponse, UserMinimal
from app.schemas.user import UserCreate
from app.core.security import verify_password, get_password_hash, create_access_token
from app.repositories.user_repository import UserRepository

class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def login(self, req: LoginRequest) -> TokenResponse:
        user = self.user_repo.get_by_email(req.email)
        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email credentials or password"
            )

        role_name = user.role_rel.name if user.role_rel else "Worker"
        token = create_access_token(subject=user.id, role=role_name)

        user_minimal = UserMinimal(
            id=user.id,
            fullName=user.full_name,
            email=user.email,
            role=role_name,
            profilePicture=user.profile_picture,
            employeeId=user.employee_id,
            department=user.department
        )

        return TokenResponse(token=token, user=user_minimal)

    def register(self, req: UserCreate) -> UserMinimal:
        if self.user_repo.get_by_email(req.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )

        if req.employeeId and self.user_repo.get_by_employee_id(req.employeeId):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this Employee ID already exists"
            )

        role = self.db.query(Role).filter(Role.name == req.role).first()
        if not role:
            role = Role(name=req.role, description=f"{req.role} Role")
            self.db.add(role)
            self.db.commit()
            self.db.refresh(role)

        new_user = User(
            full_name=req.fullName,
            email=req.email,
            mobile=req.mobileNumber,
            password_hash=get_password_hash(req.password),
            employee_id=req.employeeId,
            department=req.department,
            designation=req.designation,
            address=req.address,
            profile_picture=req.profilePicture,
            role_id=role.id
        )

        created_user = self.user_repo.create(new_user)
        return UserMinimal(
            id=created_user.id,
            fullName=created_user.full_name,
            email=created_user.email,
            role=role.name,
            profilePicture=created_user.profile_picture,
            employeeId=created_user.employee_id,
            department=created_user.department
        )
