from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rbac import RequireRole
from app.models.user import User
from app.services.material_service import MaterialService
from app.schemas.material import (
    InventoryRead,
    StockReceiveRequest,
    DirectStockUpdateRequest,
    MaterialRequestCreate,
    MaterialRequestReview,
    MaterialRequestRead,
    MaterialAllocationCreate,
    MaterialConsumptionCreate,
    MaterialReturnCreate,
    MaterialAllocationRead,
    StockMovementRead,
    ProjectMaterialUsageRead,
    InventoryDashboardRead,
)

router = APIRouter(tags=["Inventory & Stock Management"])


# --- INVENTORY MONITORING ---
@router.get("/inventory", response_model=List[InventoryRead])
def get_inventory(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return MaterialService(db).get_inventory()

@router.get("/inventory/low-stock", response_model=List[InventoryRead])
def get_low_stock_inventory(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return MaterialService(db).get_low_stock_inventory()

@router.get("/inventory/project-usage", response_model=List[ProjectMaterialUsageRead])
def get_project_material_usage(
    project_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return MaterialService(db).get_project_material_usage(project_id=project_id)

@router.get("/inventory/dashboard", response_model=InventoryDashboardRead)
def get_inventory_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return MaterialService(db).get_dashboard_metrics()

@router.post("/inventory/receive", status_code=status.HTTP_200_OK)
def receive_stock(
    req: StockReceiveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer"]))
):
    return MaterialService(db).receive_stock(req, current_user)

@router.put("/inventory/{material_id}/stock", status_code=status.HTTP_200_OK)
def update_direct_stock(
    material_id: str,
    req: DirectStockUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer"]))
):
    return MaterialService(db).update_direct_stock(material_id, req, current_user)


# --- MATERIAL REQUESTS ---
@router.get("/material-requests", response_model=List[MaterialRequestRead])
def get_material_requests(
    project_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return MaterialService(db).get_requests(project_id=project_id, status_filter=status_filter)

@router.get("/material-requests/{request_id}", response_model=MaterialRequestRead)
def get_material_request(
    request_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return MaterialService(db).get_request(request_id)

@router.post("/material-requests", response_model=MaterialRequestRead, status_code=status.HTTP_201_CREATED)
def create_material_request(
    req: MaterialRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer"]))
):
    return MaterialService(db).create_request(req, current_user)

@router.put("/material-requests/{request_id}/approve", response_model=MaterialRequestRead)
def review_material_request(
    request_id: str,
    req: MaterialRequestReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager"]))
):
    return MaterialService(db).review_request(request_id, req, current_user)


# --- MATERIAL ALLOCATIONS ---
@router.get("/material-allocations", response_model=List[MaterialAllocationRead])
def get_material_allocations(
    project_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return MaterialService(db).get_allocations(project_id=project_id)

@router.post("/material-allocations", response_model=MaterialAllocationRead, status_code=status.HTTP_201_CREATED)
def create_material_allocation(
    req: MaterialAllocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager"]))
):
    return MaterialService(db).create_allocation(req, current_user)

@router.post("/material-allocations/{allocation_id}/consume", response_model=MaterialAllocationRead)
def consume_material_allocation(
    allocation_id: str,
    req: MaterialConsumptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer"]))
):
    return MaterialService(db).consume_allocation(allocation_id, req, current_user)

@router.post("/material-allocations/{allocation_id}/return", response_model=MaterialAllocationRead)
def return_material_allocation(
    allocation_id: str,
    req: MaterialReturnCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer"]))
):
    return MaterialService(db).return_allocation(allocation_id, req.returnQuantity, req.remarks, current_user)


# --- STOCK MOVEMENTS HISTORY ---
@router.get("/stock-movements", response_model=List[StockMovementRead])
def get_stock_movements(
    material_id: Optional[str] = None,
    project_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return MaterialService(db).get_stock_movements(material_id=material_id, project_id=project_id)
