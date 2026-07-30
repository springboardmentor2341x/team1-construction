from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from schemas.auth import LoginRequest, TokenResponse, RegisterRequest

from utils.password import verify_password, hash_password
from utils.jwt_handler import create_access_token

from middleware.auth import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == request.email
    ).first()

    if user is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid Email or Password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Account Disabled"
        )
    
    if not verify_password(
        request.password,
        user.password
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid Email or Password"
        )

    token = create_access_token(user)

    return {

        "access_token": token,

        "token_type": "bearer",

        "role": user.role,

        "full_name": user.full_name

    }


@router.post("/register")
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    user_exists = db.query(User).filter(User.email == request.email).first()
    if user_exists:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    new_user = User(
        full_name=request.full_name,
        email=request.email,
        password=hash_password(request.password),
        role=request.role,
        department=request.department,
        employee_id=request.employee_id,
        mobile=request.mobile,
        address=request.address
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully", "user_id": new_user.id}


@router.get("/me")
def current_user(
    user: User = Depends(get_current_user)
):

    return {

        "id": user.id,

        "name": user.full_name,

        "email": user.email,

        "role": user.role,

        "department": user.department,

        "mobile": user.mobile,

        "address": user.address,

        "employee_id": user.employee_id

    }


@router.put("/profile")
def update_profile(
    profile: dict,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    allowed_fields = ["full_name", "mobile", "address", "department", "employee_id"]
    for key, value in profile.items():
        if key in allowed_fields and value is not None:
            setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return {
        "message": "Profile updated successfully",
        "id": user.id,
        "name": user.full_name,
        "email": user.email,
        "role": user.role,
        "department": user.department,
        "mobile": user.mobile,
        "address": user.address,
        "employee_id": user.employee_id
    }
