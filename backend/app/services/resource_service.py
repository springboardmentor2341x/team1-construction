from datetime import date, datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from fastapi import HTTPException, status

from app.models.resource import (
    ResourceModel,
    ResourceAllocationModel,
    ResourceUtilizationModel,
    ResourceMaintenanceModel,
)
from app.models.project import Project
from app.models.user import User
from app.models.placeholders import Notification
from app.schemas.resource import (
    ResourceCreate,
    ResourceUpdate,
    ResourceRead,
    ResourceAllocationCreate,
    ResourceAllocationReturn,
    ResourceAllocationRead,
    ResourceUtilizationCreate,
    ResourceUtilizationRead,
    ResourceMaintenanceCreate,
    ResourceMaintenanceUpdate,
    ResourceMaintenanceRead,
    ResourceDashboardRead,
    RESOURCE_CATEGORIES,
    RESOURCE_STATUSES,
)


class ResourceService:
    def __init__(self, db: Session):
        self.db = db

    # ------------------------------------------------------------------
    # Helper: Convert models to Read schemas with rich related names
    # ------------------------------------------------------------------
    def _to_resource_read(self, r: ResourceModel) -> ResourceRead:
        project_name = r.project.project_name if r.project else None
        return ResourceRead(
            id=r.id,
            equipmentCode=r.equipment_code,
            name=r.name,
            category=r.category,
            description=r.description,
            status=r.status,
            location=r.location or "Equipment Yard",
            responsiblePersonId=r.responsible_person_id,
            responsiblePersonName=r.responsible_person_name or (r.responsible_person.full_name if r.responsible_person else None),
            projectId=r.project_id,
            projectName=project_name,
            serialNumber=r.serial_number,
            purchaseDate=r.purchase_date,
            purchaseCost=r.purchase_cost or 0.0,
            utilizationPercentage=r.utilization_percentage or 0.0,
            createdAt=r.created_at.isoformat() if r.created_at else None,
            updatedAt=r.updated_at.isoformat() if r.updated_at else None,
        )

    def _to_allocation_read(self, a: ResourceAllocationModel) -> ResourceAllocationRead:
        r = a.resource
        p = a.project
        return ResourceAllocationRead(
            id=a.id,
            resourceId=a.resource_id,
            resourceCode=r.equipment_code if r else None,
            resourceName=r.name if r else None,
            category=r.category if r else None,
            projectId=a.project_id,
            projectName=p.project_name if p else None,
            allocationDate=a.allocation_date,
            expectedReturnDate=a.expected_return_date,
            actualReturnDate=a.actual_return_date,
            responsiblePersonId=a.responsible_person_id,
            responsiblePersonName=a.responsible_person_name,
            location=a.location,
            notes=a.notes,
            status=a.status,
            createdAt=a.created_at.isoformat() if a.created_at else None,
        )

    def _to_utilization_read(self, u: ResourceUtilizationModel) -> ResourceUtilizationRead:
        r = u.resource
        p = u.project
        return ResourceUtilizationRead(
            id=u.id,
            resourceId=u.resource_id,
            resourceCode=r.equipment_code if r else None,
            resourceName=r.name if r else None,
            category=r.category if r else None,
            projectId=u.project_id,
            projectName=p.project_name if p else None,
            date=u.date,
            operatingHours=u.operating_hours,
            idleHours=u.idle_hours,
            totalAvailableHours=u.total_available_hours,
            utilizationPercentage=u.utilization_percentage,
            notes=u.notes,
            createdAt=u.created_at.isoformat() if u.created_at else None,
        )

    def _to_maintenance_read(self, m: ResourceMaintenanceModel) -> ResourceMaintenanceRead:
        r = m.resource
        return ResourceMaintenanceRead(
            id=m.id,
            resourceId=m.resource_id,
            resourceCode=r.equipment_code if r else None,
            resourceName=r.name if r else None,
            category=r.category if r else None,
            maintenanceDate=m.maintenance_date,
            nextMaintenanceDate=m.next_maintenance_date,
            maintenanceType=m.maintenance_type,
            serviceEngineer=m.service_engineer,
            maintenanceCost=m.maintenance_cost or 0.0,
            status=m.status,
            description=m.description,
            createdAt=m.created_at.isoformat() if m.created_at else None,
            updatedAt=m.updated_at.isoformat() if m.updated_at else None,
        )

    # ------------------------------------------------------------------
    # Resource Master Data CRUD
    # ------------------------------------------------------------------
    def get_resources(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        status_filter: Optional[str] = None,
        project_id: Optional[str] = None,
        location: Optional[str] = None,
    ) -> List[ResourceRead]:
        query = self.db.query(ResourceModel)

        if search:
            s = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    ResourceModel.equipment_code.ilike(s),
                    ResourceModel.name.ilike(s),
                    ResourceModel.description.ilike(s),
                    ResourceModel.location.ilike(s),
                )
            )
        if category:
            query = query.filter(ResourceModel.category == category)
        if status_filter:
            query = query.filter(ResourceModel.status == status_filter)
        if project_id:
            query = query.filter(ResourceModel.project_id == project_id)
        if location:
            query = query.filter(ResourceModel.location.ilike(f"%{location.strip()}%"))

        resources = query.order_by(ResourceModel.equipment_code.asc()).all()
        return [self._to_resource_read(r) for r in resources]

    def get_resource_by_id(self, resource_id: str) -> ResourceRead:
        r = self.db.query(ResourceModel).filter(ResourceModel.id == resource_id).first()
        if not r:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
        return self._to_resource_read(r)

    def create_resource(self, req: ResourceCreate, current_user: User) -> ResourceRead:
        # Check Equipment Code uniqueness
        existing = self.db.query(ResourceModel).filter(ResourceModel.equipment_code == req.equipmentCode.strip()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Equipment code '{req.equipmentCode}' already exists. Code must be unique."
            )

        # Validate responsible person if provided
        resp_person_name = req.responsiblePersonName
        if req.responsiblePersonId:
            user = self.db.query(User).filter(User.id == req.responsiblePersonId).first()
            if user:
                resp_person_name = user.full_name

        new_resource = ResourceModel(
            equipment_code=req.equipmentCode.strip(),
            name=req.name.strip(),
            category=req.category,
            description=req.description,
            status=req.status,
            location=req.location or "Equipment Yard",
            responsible_person_id=req.responsiblePersonId,
            responsible_person_name=resp_person_name,
            project_id=req.projectId,
            serial_number=req.serialNumber,
            purchase_date=req.purchaseDate,
            purchase_cost=req.purchaseCost or 0.0,
            created_by=current_user.id if current_user else None,
        )
        self.db.add(new_resource)
        self.db.commit()
        self.db.refresh(new_resource)
        return self._to_resource_read(new_resource)

    def update_resource(self, resource_id: str, updates: ResourceUpdate, current_user: User) -> ResourceRead:
        r = self.db.query(ResourceModel).filter(ResourceModel.id == resource_id).first()
        if not r:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")

        if updates.name is not None:
            r.name = updates.name.strip()
        if updates.category is not None:
            r.category = updates.category
        if updates.description is not None:
            r.description = updates.description
        if updates.status is not None:
            r.status = updates.status
        if updates.location is not None:
            r.location = updates.location
        if updates.responsiblePersonId is not None:
            r.responsible_person_id = updates.responsiblePersonId
            user = self.db.query(User).filter(User.id == updates.responsiblePersonId).first()
            if user:
                r.responsible_person_name = user.full_name
        if updates.responsiblePersonName is not None:
            r.responsible_person_name = updates.responsiblePersonName
        if updates.projectId is not None:
            r.project_id = updates.projectId
        if updates.serialNumber is not None:
            r.serial_number = updates.serialNumber
        if updates.purchaseDate is not None:
            r.purchase_date = updates.purchaseDate
        if updates.purchaseCost is not None:
            r.purchase_cost = updates.purchaseCost

        self.db.commit()
        self.db.refresh(r)
        return self._to_resource_read(r)

    def update_resource_status(self, resource_id: str, new_status: str, current_user: User) -> ResourceRead:
        r = self.db.query(ResourceModel).filter(ResourceModel.id == resource_id).first()
        if not r:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")

        r.status = new_status
        if new_status in ["Available", "Out of Service"] and not r.allocations:
            r.project_id = None
        self.db.commit()
        self.db.refresh(r)
        return self._to_resource_read(r)

    def delete_resource(self, resource_id: str) -> bool:
        r = self.db.query(ResourceModel).filter(ResourceModel.id == resource_id).first()
        if not r:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
        self.db.delete(r)
        self.db.commit()
        return True

    # ------------------------------------------------------------------
    # Equipment Allocation Logic & Conflict Prevention
    # ------------------------------------------------------------------
    def create_allocation(self, req: ResourceAllocationCreate, current_user: User) -> ResourceAllocationRead:
        resource = self.db.query(ResourceModel).filter(ResourceModel.id == req.resourceId).first()
        if not resource:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")

        project = self.db.query(Project).filter(Project.id == req.projectId).first()
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        if project.status == "Closed":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot allocate resources to a closed project")

        # Check status: Under Maintenance or Out of Service cannot be allocated
        if resource.status in ["Under Maintenance", "Out of Service"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Equipment '{resource.equipment_code}' is currently {resource.status} and cannot be allocated."
            )

        # Validate date range
        if req.expectedReturnDate < req.allocationDate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Expected return date cannot be before allocation date."
            )

        # CRITICAL OVERLAPPING ALLOCATION BUSINESS RULE:
        # Check active allocations for date range conflict:
        # overlap if not (new_end < exist_start or new_start > exist_end)
        active_allocations = self.db.query(ResourceAllocationModel).filter(
            ResourceAllocationModel.resource_id == req.resourceId,
            ResourceAllocationModel.status == "Active"
        ).all()

        for a in active_allocations:
            if not (req.expectedReturnDate < a.allocation_date or req.allocationDate > a.expected_return_date):
                proj_name = a.project.project_name if a.project else "another project"
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"This equipment is already allocated to {proj_name} during the selected period ({a.allocation_date} to {a.expected_return_date})."
                )

        resp_person_name = req.responsiblePersonName
        if req.responsiblePersonId:
            user = self.db.query(User).filter(User.id == req.responsiblePersonId).first()
            if user:
                resp_person_name = user.full_name

        allocation = ResourceAllocationModel(
            resource_id=req.resourceId,
            project_id=req.projectId,
            allocation_date=req.allocationDate,
            expected_return_date=req.expectedReturnDate,
            responsible_person_id=req.responsiblePersonId,
            responsible_person_name=resp_person_name,
            location=req.location or project.location or "Site",
            notes=req.notes,
            status="Active",
        )
        self.db.add(allocation)

        # Update resource status & current project
        resource.status = "Allocated"
        resource.project_id = req.projectId
        resource.location = req.location or project.location or "Site"
        if resp_person_name:
            resource.responsible_person_name = resp_person_name
        if req.responsiblePersonId:
            resource.responsible_person_id = req.responsiblePersonId

        self.db.commit()
        self.db.refresh(allocation)
        return self._to_allocation_read(allocation)

    def return_allocation(self, allocation_id: str, return_date: Optional[str], current_user: User) -> ResourceAllocationRead:
        alloc = self.db.query(ResourceAllocationModel).filter(ResourceAllocationModel.id == allocation_id).first()
        if not alloc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Allocation record not found")

        if alloc.status == "Returned":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Allocation is already returned.")

        ret_dt = return_date or date.today().isoformat()
        alloc.status = "Returned"
        alloc.actual_return_date = ret_dt

        # Check if resource has other active allocations or active maintenance
        resource = alloc.resource
        if resource:
            other_active_allocs = self.db.query(ResourceAllocationModel).filter(
                ResourceAllocationModel.resource_id == resource.id,
                ResourceAllocationModel.status == "Active",
                ResourceAllocationModel.id != alloc.id
            ).first()

            active_maint = self.db.query(ResourceMaintenanceModel).filter(
                ResourceMaintenanceModel.resource_id == resource.id,
                ResourceMaintenanceModel.status == "In Progress"
            ).first()

            if active_maint:
                resource.status = "Under Maintenance"
            elif other_active_allocs:
                resource.status = "Allocated"
                resource.project_id = other_active_allocs.project_id
            else:
                resource.status = "Available"
                resource.project_id = None
                resource.location = "Equipment Yard"

        self.db.commit()
        self.db.refresh(alloc)
        return self._to_allocation_read(alloc)

    def get_allocations(self, project_id: Optional[str] = None, resource_id: Optional[str] = None, status_filter: Optional[str] = None) -> List[ResourceAllocationRead]:
        query = self.db.query(ResourceAllocationModel)
        if project_id:
            query = query.filter(ResourceAllocationModel.project_id == project_id)
        if resource_id:
            query = query.filter(ResourceAllocationModel.resource_id == resource_id)
        if status_filter:
            query = query.filter(ResourceAllocationModel.status == status_filter)

        allocs = query.order_by(ResourceAllocationModel.created_at.desc()).all()
        return [self._to_allocation_read(a) for a in allocs]

    # ------------------------------------------------------------------
    # Resource Availability Searching
    # ------------------------------------------------------------------
    def check_availability(
        self,
        category: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> List[ResourceRead]:
        # Filter resources that are not Out of Service or Under Maintenance
        query = self.db.query(ResourceModel).filter(
            ResourceModel.status.notin_(["Out of Service", "Under Maintenance"])
        )
        if category:
            query = query.filter(ResourceModel.category == category)

        resources = query.all()
        available_resources = []

        s_date = start_date or date.today().isoformat()
        e_date = end_date or s_date

        for r in resources:
            # Check for overlapping active allocations
            active_allocs = self.db.query(ResourceAllocationModel).filter(
                ResourceAllocationModel.resource_id == r.id,
                ResourceAllocationModel.status == "Active"
            ).all()

            has_conflict = False
            for a in active_allocs:
                if not (e_date < a.allocation_date or s_date > a.expected_return_date):
                    has_conflict = True
                    break

            if not has_conflict:
                available_resources.append(self._to_resource_read(r))

        return available_resources

    # ------------------------------------------------------------------
    # Resource Utilization Tracking & Calculations
    # ------------------------------------------------------------------
    def create_utilization(self, req: ResourceUtilizationCreate, current_user: User) -> ResourceUtilizationRead:
        resource = self.db.query(ResourceModel).filter(ResourceModel.id == req.resourceId).first()
        if not resource:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")

        if req.operatingHours < 0 or req.idleHours < 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hours cannot be negative.")

        if req.operatingHours + req.idleHours > 24.0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Total hours in a day cannot exceed 24.")

        total_avail = max(req.totalAvailableHours, req.operatingHours + req.idleHours, 1.0)
        if req.operatingHours > total_avail:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Operating hours cannot exceed total available hours.")

        util_pct = round((req.operatingHours / total_avail) * 100.0, 1)

        new_util = ResourceUtilizationModel(
            resource_id=req.resourceId,
            project_id=req.projectId or resource.project_id,
            date=req.date,
            operating_hours=req.operatingHours,
            idle_hours=req.idleHours,
            total_available_hours=total_avail,
            utilization_percentage=util_pct,
            notes=req.notes,
        )
        self.db.add(new_util)

        # Recalculate resource overall average utilization
        util_records = self.db.query(ResourceUtilizationModel).filter(ResourceUtilizationModel.resource_id == req.resourceId).all()
        all_pcts = [u.utilization_percentage for u in util_records] + [util_pct]
        resource.utilization_percentage = round(sum(all_pcts) / len(all_pcts), 1)

        self.db.commit()
        self.db.refresh(new_util)
        return self._to_utilization_read(new_util)

    def get_utilizations(self, resource_id: Optional[str] = None, project_id: Optional[str] = None) -> List[ResourceUtilizationRead]:
        query = self.db.query(ResourceUtilizationModel)
        if resource_id:
            query = query.filter(ResourceUtilizationModel.resource_id == resource_id)
        if project_id:
            query = query.filter(ResourceUtilizationModel.project_id == project_id)

        utils = query.order_by(ResourceUtilizationModel.date.desc()).all()
        return [self._to_utilization_read(u) for u in utils]

    # ------------------------------------------------------------------
    # Maintenance Scheduling & Lifecycle
    # ------------------------------------------------------------------
    def create_maintenance(self, req: ResourceMaintenanceCreate, current_user: User) -> ResourceMaintenanceRead:
        resource = self.db.query(ResourceModel).filter(ResourceModel.id == req.resourceId).first()
        if not resource:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")

        if req.maintenanceCost < 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Maintenance cost cannot be negative.")

        maint = ResourceMaintenanceModel(
            resource_id=req.resourceId,
            maintenance_date=req.maintenanceDate,
            next_maintenance_date=req.nextMaintenanceDate,
            maintenance_type=req.maintenanceType,
            service_engineer=req.serviceEngineer or current_user.full_name,
            maintenance_cost=req.maintenanceCost,
            status=req.status,
            description=req.description,
        )
        self.db.add(maint)

        # Update resource status if maintenance is active or scheduled
        if req.status in ["In Progress", "Scheduled"]:
            resource.status = "Under Maintenance"

        # INTEGRATION WITH MODULE 11 BUDGET & COST
        if req.maintenanceCost and req.maintenanceCost > 0 and resource.project_id:
            from app.models.budget import ActualExpense
            import uuid
            exp_count = self.db.query(func.count(ActualExpense.id)).scalar() or 0
            exp = ActualExpense(
                id=str(uuid.uuid4()),
                project_id=resource.project_id,
                expense_code=f"EXP-MNT-{(exp_count + 1):04d}",
                category="Maintenance",
                amount=req.maintenanceCost,
                expense_date=req.maintenanceDate or date.today().isoformat(),
                description=f"Equipment maintenance cost for {resource.name} ({resource.equipment_code}) - {req.maintenanceType}",
                equipment_id=resource.id,
                source_reference=f"Maint:{maint.id}",
                created_by=current_user.id
            )
            self.db.add(exp)

        self.db.commit()
        self.db.refresh(maint)
        return self._to_maintenance_read(maint)

    def update_maintenance(self, maintenance_id: str, updates: ResourceMaintenanceUpdate, current_user: User) -> ResourceMaintenanceRead:
        maint = self.db.query(ResourceMaintenanceModel).filter(ResourceMaintenanceModel.id == maintenance_id).first()
        if not maint:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance record not found")

        if updates.maintenanceDate is not None:
            maint.maintenance_date = updates.maintenanceDate
        if updates.nextMaintenanceDate is not None:
            maint.next_maintenance_date = updates.nextMaintenanceDate
        if updates.maintenanceType is not None:
            maint.maintenance_type = updates.maintenanceType
        if updates.serviceEngineer is not None:
            maint.service_engineer = updates.serviceEngineer
        if updates.maintenanceCost is not None:
            maint.maintenance_cost = updates.maintenanceCost
        if updates.description is not None:
            maint.description = updates.description

        if updates.status is not None:
            maint.status = updates.status
            resource = maint.resource
            if resource:
                if updates.status == "In Progress":
                    resource.status = "Under Maintenance"
                elif updates.status == "Completed":
                    # Check if there are other active maintenances
                    other_in_prog = self.db.query(ResourceMaintenanceModel).filter(
                        ResourceMaintenanceModel.resource_id == resource.id,
                        ResourceMaintenanceModel.status == "In Progress",
                        ResourceMaintenanceModel.id != maint.id
                    ).first()

                    if not other_in_prog:
                        # If equipment has active allocation, restore Allocated, else Available
                        active_alloc = self.db.query(ResourceAllocationModel).filter(
                            ResourceAllocationModel.resource_id == resource.id,
                            ResourceAllocationModel.status == "Active"
                        ).first()

                        if active_alloc:
                            resource.status = "Allocated"
                        else:
                            resource.status = "Available"

        self.db.commit()
        self.db.refresh(maint)
        return self._to_maintenance_read(maint)

    def get_maintenances(self, resource_id: Optional[str] = None, status_filter: Optional[str] = None) -> List[ResourceMaintenanceRead]:
        query = self.db.query(ResourceMaintenanceModel)
        if resource_id:
            query = query.filter(ResourceMaintenanceModel.resource_id == resource_id)
        if status_filter:
            query = query.filter(ResourceMaintenanceModel.status == status_filter)

        records = query.order_by(ResourceMaintenanceModel.maintenance_date.desc()).all()
        return [self._to_maintenance_read(m) for m in records]

    def get_maintenance_due(self) -> Dict[str, Any]:
        today_str = date.today().isoformat()
        in_7_days_str = (date.today() + timedelta(days=7)).isoformat()

        # Overdue maintenance
        overdue_records = self.db.query(ResourceMaintenanceModel).filter(
            ResourceMaintenanceModel.next_maintenance_date < today_str,
            ResourceMaintenanceModel.status != "Completed"
        ).all()

        # Due soon maintenance (within 7 days)
        due_soon_records = self.db.query(ResourceMaintenanceModel).filter(
            ResourceMaintenanceModel.next_maintenance_date >= today_str,
            ResourceMaintenanceModel.next_maintenance_date <= in_7_days_str,
            ResourceMaintenanceModel.status != "Completed"
        ).all()

        # In Progress
        in_progress_records = self.db.query(ResourceMaintenanceModel).filter(
            ResourceMaintenanceModel.status == "In Progress"
        ).all()

        # Generate notifications for overdue maintenance items
        for m in overdue_records:
            r = m.resource
            if r:
                notif_exists = self.db.query(Notification).filter(
                    Notification.title == f"Maintenance Overdue: {r.equipment_code}"
                ).first()
                if not notif_exists:
                    self.db.add(Notification(
                        title=f"Maintenance Overdue: {r.equipment_code}",
                        message=f"{r.name} ({r.equipment_code}) maintenance was due on {m.next_maintenance_date}.",
                        notification_type="warning",
                        category="Resource",
                        time="Just now",
                    ))
        self.db.commit()

        return {
            "overdueCount": len(overdue_records),
            "dueSoonCount": len(due_soon_records),
            "inProgressCount": len(in_progress_records),
            "overdue": [self._to_maintenance_read(m) for m in overdue_records],
            "dueSoon": [self._to_maintenance_read(m) for m in due_soon_records],
            "inProgress": [self._to_maintenance_read(m) for m in in_progress_records],
        }

    # ------------------------------------------------------------------
    # Dashboard KPI Aggregations
    # ------------------------------------------------------------------
    def get_dashboard(self) -> ResourceDashboardRead:
        resources = self.db.query(ResourceModel).all()

        total = len(resources)
        available = sum(1 for r in resources if r.status == "Available")
        allocated = sum(1 for r in resources if r.status == "Allocated")
        maintenance = sum(1 for r in resources if r.status == "Under Maintenance")
        out_of_service = sum(1 for r in resources if r.status == "Out of Service")

        cat_counts = {cat: 0 for cat in RESOURCE_CATEGORIES}
        for r in resources:
            if r.category in cat_counts:
                cat_counts[r.category] += 1
            else:
                cat_counts[r.category] = 1

        status_counts = {st: 0 for st in RESOURCE_STATUSES}
        for r in resources:
            if r.status in status_counts:
                status_counts[r.status] += 1
            else:
                status_counts[r.status] = 1

        avg_util = round(sum(r.utilization_percentage or 0.0 for r in resources) / max(total, 1), 1)
        idle_pct = round(max(0.0, 100.0 - avg_util), 1)

        recent_allocs = self.get_allocations()[:5]
        recent_maints = self.get_maintenances()[:5]
        due_info = self.get_maintenance_due()

        return ResourceDashboardRead(
            totalResources=total,
            availableCount=available,
            allocatedCount=allocated,
            underMaintenanceCount=maintenance,
            outOfServiceCount=out_of_service,
            upcomingMaintenanceCount=due_info["dueSoonCount"] + due_info["overdueCount"],
            avgUtilizationPercentage=avg_util,
            idlePercentage=idle_pct,
            categoryCounts=cat_counts,
            statusCounts=status_counts,
            recentAllocations=recent_allocs,
            recentMaintenances=recent_maints,
        )
