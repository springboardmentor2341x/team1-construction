from sqlalchemy import Column, Integer, String, Boolean
from database import Base


class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False)

    password = Column(String, nullable=False)

    role = Column(String, nullable=False)

    department = Column(String)

    employee_id = Column(String)

    mobile = Column(String)

    address = Column(String)

    profile_image = Column(String)

    is_active = Column(Boolean, default=True)
