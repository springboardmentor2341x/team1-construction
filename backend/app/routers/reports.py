from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.dependencies.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Module 10 - Reports & Documentation System"])


# 1. Project Progress Report APIs
@router.get("/projects/{project_id}/progress")
def get_project_progress_report_api(
    project_id: str,
    statusFilter: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch live Project Progress Report data for preview."""
    try:
        return ReportService.get_project_progress_report(db, current_user, project_id, status_filter=statusFilter, search=search)
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


@router.get("/projects/{project_id}/progress/pdf")
def export_project_progress_report_pdf_api(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export Project Progress Report as formatted PDF document."""
    try:
        pdf_bytes = ReportService.export_report_pdf(db, current_user, project_id, report_type="progress")
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=buildtrack_progress_report_{project_id}.pdf"}
        )
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


@router.get("/projects/{project_id}/progress/excel")
def export_project_progress_report_excel_api(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export Project Progress Report as formatted Excel spreadsheet."""
    try:
        excel_bytes = ReportService.export_report_excel(db, current_user, project_id, report_type="progress")
        return Response(
            content=excel_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=buildtrack_progress_report_{project_id}.xlsx"}
        )
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


# 2. Resource Utilization Report APIs
@router.get("/projects/{project_id}/resources")
def get_resource_utilization_report_api(
    project_id: str,
    statusFilter: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch live Resource & Equipment Utilization Report data."""
    try:
        return ReportService.get_resource_utilization_report(db, current_user, project_id, status_filter=statusFilter, search=search)
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


@router.get("/projects/{project_id}/resources/pdf")
def export_resource_report_pdf_api(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export Resource Utilization Report as PDF."""
    try:
        pdf_bytes = ReportService.export_report_pdf(db, current_user, project_id, report_type="resources")
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=buildtrack_resources_report_{project_id}.pdf"}
        )
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


@router.get("/projects/{project_id}/resources/excel")
def export_resource_report_excel_api(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export Resource Utilization Report as Excel."""
    try:
        excel_bytes = ReportService.export_report_excel(db, current_user, project_id, report_type="resources")
        return Response(
            content=excel_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=buildtrack_resources_report_{project_id}.xlsx"}
        )
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


# 3. Workforce Report APIs
@router.get("/projects/{project_id}/workforce")
def get_workforce_report_api(
    project_id: str,
    statusFilter: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch live Workforce & Attendance Report data."""
    try:
        return ReportService.get_workforce_report(db, current_user, project_id, status_filter=statusFilter, search=search)
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


@router.get("/projects/{project_id}/workforce/pdf")
def export_workforce_report_pdf_api(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export Workforce Report as PDF."""
    try:
        pdf_bytes = ReportService.export_report_pdf(db, current_user, project_id, report_type="workforce")
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=buildtrack_workforce_report_{project_id}.pdf"}
        )
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


@router.get("/projects/{project_id}/workforce/excel")
def export_workforce_report_excel_api(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export Workforce Report as Excel."""
    try:
        excel_bytes = ReportService.export_report_excel(db, current_user, project_id, report_type="workforce")
        return Response(
            content=excel_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=buildtrack_workforce_report_{project_id}.xlsx"}
        )
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


# 4. Procurement Report APIs
@router.get("/projects/{project_id}/procurement")
def get_procurement_report_api(
    project_id: str,
    statusFilter: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch live Procurement & Purchase Orders Report data."""
    try:
        return ReportService.get_procurement_report(db, current_user, project_id, status_filter=statusFilter, search=search)
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


@router.get("/projects/{project_id}/procurement/pdf")
def export_procurement_report_pdf_api(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export Procurement Report as PDF."""
    try:
        pdf_bytes = ReportService.export_report_pdf(db, current_user, project_id, report_type="procurement")
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=buildtrack_procurement_report_{project_id}.pdf"}
        )
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


@router.get("/projects/{project_id}/procurement/excel")
def export_procurement_report_excel_api(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export Procurement Report as Excel."""
    try:
        excel_bytes = ReportService.export_report_excel(db, current_user, project_id, report_type="procurement")
        return Response(
            content=excel_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=buildtrack_procurement_report_{project_id}.xlsx"}
        )
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


# 5. Budget Report APIs
@router.get("/projects/{project_id}/budget")
def get_budget_report_api(
    project_id: str,
    statusFilter: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch live Budget & Expense Report data."""
    try:
        return ReportService.get_budget_report(db, current_user, project_id, status_filter=statusFilter, search=search)
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


@router.get("/projects/{project_id}/budget/pdf")
def export_budget_report_pdf_api(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export Budget Report as PDF."""
    try:
        pdf_bytes = ReportService.export_report_pdf(db, current_user, project_id, report_type="budget")
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=buildtrack_budget_report_{project_id}.pdf"}
        )
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


@router.get("/projects/{project_id}/budget/excel")
def export_budget_report_excel_api(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export Budget Report as Excel."""
    try:
        excel_bytes = ReportService.export_report_excel(db, current_user, project_id, report_type="budget")
        return Response(
            content=excel_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=buildtrack_budget_report_{project_id}.xlsx"}
        )
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
