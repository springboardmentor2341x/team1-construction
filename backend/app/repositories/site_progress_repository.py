from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.site_progress import (
    DailyProgressReport,
    WeeklyProgressReport,
    WorkCompletionStatus,
    DelayTracking,
    SiteActivityLog,
    ProgressPhotograph,
)


class DailyReportRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, report_id: str) -> Optional[DailyProgressReport]:
        return self.db.query(DailyProgressReport).filter(DailyProgressReport.id == report_id).first()

    def get_by_project(self, project_id: str) -> List[DailyProgressReport]:
        return (
            self.db.query(DailyProgressReport)
            .filter(DailyProgressReport.project_id == project_id)
            .order_by(DailyProgressReport.report_date.desc(), DailyProgressReport.created_at.desc())
            .all()
        )

    def get_in_date_range(self, project_id: str, start_date: str, end_date: str) -> List[DailyProgressReport]:
        return (
            self.db.query(DailyProgressReport)
            .filter(
                DailyProgressReport.project_id == project_id,
                DailyProgressReport.report_date >= start_date,
                DailyProgressReport.report_date <= end_date,
            )
            .order_by(DailyProgressReport.report_date.asc())
            .all()
        )

    def get_all(self) -> List[DailyProgressReport]:
        return self.db.query(DailyProgressReport).order_by(DailyProgressReport.report_date.desc()).all()

    def create(self, report: DailyProgressReport) -> DailyProgressReport:
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def update(self, report: DailyProgressReport) -> DailyProgressReport:
        self.db.commit()
        self.db.refresh(report)
        return report

    def delete(self, report: DailyProgressReport) -> None:
        self.db.delete(report)
        self.db.commit()


class WeeklyReportRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, report_id: str) -> Optional[WeeklyProgressReport]:
        return self.db.query(WeeklyProgressReport).filter(WeeklyProgressReport.id == report_id).first()

    def get_by_project(self, project_id: str) -> List[WeeklyProgressReport]:
        return (
            self.db.query(WeeklyProgressReport)
            .filter(WeeklyProgressReport.project_id == project_id)
            .order_by(WeeklyProgressReport.week_start_date.desc())
            .all()
        )

    def get_all(self) -> List[WeeklyProgressReport]:
        return self.db.query(WeeklyProgressReport).order_by(WeeklyProgressReport.week_start_date.desc()).all()

    def create(self, report: WeeklyProgressReport) -> WeeklyProgressReport:
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def update(self, report: WeeklyProgressReport) -> WeeklyProgressReport:
        self.db.commit()
        self.db.refresh(report)
        return report

    def delete(self, report: WeeklyProgressReport) -> None:
        self.db.delete(report)
        self.db.commit()


class CompletionStatusRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_project(self, project_id: str) -> Optional[WorkCompletionStatus]:
        return (
            self.db.query(WorkCompletionStatus)
            .filter(WorkCompletionStatus.project_id == project_id)
            .first()
        )

    def upsert(self, project_id: str, overall_percentage: int, category_breakdown: dict) -> WorkCompletionStatus:
        status = self.get_by_project(project_id)
        if status:
            status.overall_completion_percentage = overall_percentage
            status.category_breakdown = category_breakdown
        else:
            status = WorkCompletionStatus(
                project_id=project_id,
                overall_completion_percentage=overall_percentage,
                category_breakdown=category_breakdown,
            )
            self.db.add(status)
        self.db.commit()
        self.db.refresh(status)
        return status


class DelayTrackingRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, delay_id: str) -> Optional[DelayTracking]:
        return self.db.query(DelayTracking).filter(DelayTracking.id == delay_id).first()

    def get_by_project(self, project_id: str) -> List[DelayTracking]:
        return (
            self.db.query(DelayTracking)
            .filter(DelayTracking.project_id == project_id)
            .order_by(DelayTracking.reported_date.desc())
            .all()
        )

    def get_all(self) -> List[DelayTracking]:
        return self.db.query(DelayTracking).order_by(DelayTracking.reported_date.desc()).all()

    def create(self, delay: DelayTracking) -> DelayTracking:
        self.db.add(delay)
        self.db.commit()
        self.db.refresh(delay)
        return delay

    def update(self, delay: DelayTracking) -> DelayTracking:
        self.db.commit()
        self.db.refresh(delay)
        return delay

    def delete(self, delay: DelayTracking) -> None:
        self.db.delete(delay)
        self.db.commit()


class SiteActivityLogRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, log_id: str) -> Optional[SiteActivityLog]:
        return self.db.query(SiteActivityLog).filter(SiteActivityLog.id == log_id).first()

    def get_by_project(self, project_id: str) -> List[SiteActivityLog]:
        return (
            self.db.query(SiteActivityLog)
            .filter(SiteActivityLog.project_id == project_id)
            .order_by(SiteActivityLog.activity_date.desc(), SiteActivityLog.activity_time.desc())
            .all()
        )

    def get_all(self) -> List[SiteActivityLog]:
        return self.db.query(SiteActivityLog).order_by(SiteActivityLog.activity_date.desc()).all()

    def create(self, log: SiteActivityLog) -> SiteActivityLog:
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def update(self, log: SiteActivityLog) -> SiteActivityLog:
        self.db.commit()
        self.db.refresh(log)
        return log

    def delete(self, log: SiteActivityLog) -> None:
        self.db.delete(log)
        self.db.commit()


class PhotographRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_report(self, report_id: str) -> List[ProgressPhotograph]:
        return (
            self.db.query(ProgressPhotograph)
            .filter(ProgressPhotograph.report_id == report_id)
            .all()
        )

    def create(self, photo: ProgressPhotograph) -> ProgressPhotograph:
        self.db.add(photo)
        self.db.commit()
        self.db.refresh(photo)
        return photo

    def delete(self, photo_id: str) -> None:
        photo = self.db.query(ProgressPhotograph).filter(ProgressPhotograph.id == photo_id).first()
        if photo:
            self.db.delete(photo)
            self.db.commit()

