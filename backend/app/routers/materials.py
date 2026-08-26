from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rbac import RequireRole
from app.models.user import User
from app.services.material_service import MaterialService
from app.schemas.material import (
    MaterialCategoryCreate,
    MaterialCategoryRead,
    MaterialCreate,
    MaterialUpdate,
    MaterialRead,
    StockReceiveRequest,
    InventoryRead,
    MaterialRequestCreate,
    MaterialRequestReview,
    MaterialRequestRead,
    MaterialAllocationCreate,
    MaterialConsumptionCreate,
    MaterialAllocationRead,
    StockMovementRead,
    ProjectMaterialUsageRead,
    InventoryDashboardRead,
)

router = APIRouter(prefix="/materials", tags=["Materials & Inventory"])


# --- CATEGORIES ---
@router.get("/categories", response_model=List[MaterialCategoryRead])
def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return MaterialService(db).get_categories()

@router.post("/categories", response_model=MaterialCategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(
    req: MaterialCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager"]))
):
    return MaterialService(db).create_category(req)


# --- MATERIALS MASTER ---
@router.get("", response_model=List[MaterialRead])
def get_materials(
    category_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return MaterialService(db).get_materials(category_id=category_id)

@router.get("/{material_id}", response_model=MaterialRead)
def get_material(
    material_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return MaterialService(db).get_material(material_id)

@router.post("", response_model=MaterialRead, status_code=status.HTTP_201_CREATED)
def create_material(
    req: MaterialCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager"]))
):
    return MaterialService(db).create_material(req, current_user)

@router.put("/{material_id}", response_model=MaterialRead)
def update_material(
    material_id: str,
    req: MaterialUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager"]))
):
    return MaterialService(db).update_material(material_id, req)
