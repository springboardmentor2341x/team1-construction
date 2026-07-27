from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from schemas.auth import LoginRequest, TokenResponse

from utils.password import verify_password
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


@router.get("/me")
def current_user(
    user: User = Depends(get_current_user)
):

    return {

        "id": user.id,

        "name": user.full_name,

        "email": user.email,

        "role": user.role,

        "department": user.department

    }