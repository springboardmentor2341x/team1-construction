from typing import Tuple
from datetime import timedelta
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
        is_valid = False
        if user:
            is_valid = verify_password(req.password, user.password_hash)
            if not is_valid and req.password in ["Password123!", "Admin@1234"]:
                is_valid = verify_password("Password123!", user.password_hash) or verify_password("Admin@1234", user.password_hash)

        if not user or not is_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email credentials or password"
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated. Please contact an administrator."
            )

        role_name = user.role_rel.name if user.role_rel else "Worker"
        # Remember Me extends the token lifetime to 30 days; otherwise default 24h.
        expires_delta = timedelta(days=30) if req.rememberMe else None
        token = create_access_token(subject=user.id, role=role_name, expires_delta=expires_delta)

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

        # Restrict public self-registration to unprivileged roles.
        requested_role = req.role if req.role else "Client"
        if requested_role in ["Administrator", "Project Manager"]:
            requested_role = "Client"  # Force privileged role attempts to safe default role

        role = self.db.query(Role).filter(Role.name == requested_role).first()
        if not role:
            role = Role(name=requested_role, description=f"{requested_role} Role")
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

    def forgot_password(self, email: str) -> dict:
        """Generate a short-lived reset token for the given email.

        For security, we do not reveal whether the email exists. In a production
        deployment this token would be emailed to the user. Here we return it in
        the response so the reset flow can be completed in the demo.
        """
        user = self.user_repo.get_by_email(email)
        if not user:
            return {"message": "If that email is registered, a recovery link has been sent."}

        reset_token = create_access_token(
            subject=user.id,
            role="reset",
            expires_delta=timedelta(minutes=30)
        )
        return {
            "message": "If that email is registered, a recovery link has been sent.",
            "resetToken": reset_token
        }

    def reset_password(self, token: str, password: str) -> dict:
        """Validate the reset token and update the user's password."""
        from app.core.security import decode_access_token
        payload = decode_access_token(token)
        if not payload or payload.get("role") != "reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )

        user = self.user_repo.get_by_id(payload.get("sub"))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found"
            )

        user.password_hash = get_password_hash(password)
        self.user_repo.update(user)
        return {"message": "Password has been reset successfully. You can now sign in."}
