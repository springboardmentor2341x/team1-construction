from typing import Optional, List
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.role import Role

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        normalized_email = email.lower().strip()
        return self.db.query(User).filter(func.lower(User.email) == normalized_email).first()

    def get_by_employee_id(self, employee_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.employee_id == employee_id).first()

    def get_all(self, role_name: Optional[str] = None) -> List[User]:
        query = self.db.query(User)
        if role_name:
            query = query.join(Role).filter(Role.name == role_name)
        return query.all()

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: User) -> User:
        self.db.commit()
        self.db.refresh(user)
        return user
