from typing import List, Optional, Dict
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.placeholders import Inventory, Notification, Attendance, Procurement
from app.models.site_progress import (
    DailyProgressReport,
    WeeklyProgressReport,
    DelayTracking,
    SiteActivityLog,
    ProgressPhotograph,
)
from app.models.project import Project
from app.models.milestone import ProjectMilestone
from app.schemas.site_progress import (
    PROGRESS_CATEGORIES,
    DailyProgressReportCreate,
    DailyProgressReportRead,
    DailyProgressReportUpdate,
    WeeklyProgressReportCreate,
    WeeklyProgressReportRead,
    DelayTrackingCreate,
    DelayTrackingRead,
    DelayTrackingUpdate,
    SiteActivityLogCreate,
    SiteActivityLogRead,
    SiteActivityLogUpdate,
    ProgressPhotographCreate,
    ProgressPhotographRead,
    WorkCompletionStatusRead,
    MilestoneTrackingRead,
    SiteProgressDashboardRead,
)
from app.repositories.site_progress_repository import (
    DailyReportRepository,
    WeeklyReportRepository,
    CompletionStatusRepository,
    DelayTrackingRepository,
    SiteActivityLogRepository,
    PhotographRepository,
)


class SiteProgressService:
    def __init__(self, db: Session):
        self.db = db
        self.daily_repo = DailyReportRepository(db)
        self.weekly_repo = WeeklyReportRepository(db)
        self.completion_repo = CompletionStatusRepository(db)
        self.delay_repo = DelayTrackingRepository(db)
        self.activity_repo = SiteActivityLogRepository(db)
        self.photo_repo = PhotographRepository(db)

    # Category weights for weighted completion calculation.
    # These reflect the relative contribution of each work category to overall
    # project completion and match the business rule described in the spec.
    CATEGORY_WEIGHTS = {
        "Foundation": 0.25,
        "Structural Work": 0.30,
        "Electrical Work": 0.15,
        "Plumbing Work": 0.10,
        "Finishing Work": 0.15,
        "Inspection Work": 0.05,
    }

    # ------------------------------------------------------------------
    # Helper: validate project exists
    # ------------------------------------------------------------------
    def _require_project(self, project_id: str, require_open: bool = False) -> Project:
        proj = self.db.query(Project).filter(Project.id == project_id).first()
        if not proj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        if require_open and proj.status == "Closed":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot log progress or modify data on a closed project")
        return proj

    def _verify_project_not_closed(self, project_id: str):
        proj = self.db.query(Project).filter(Project.id == project_id).first()
        if proj and proj.status == "Closed":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot log progress or modify data on a closed project")

    # ------------------------------------------------------------------
    # Integration helpers: update dependent modules from daily reports
    # ------------------------------------------------------------------
    def _update_inventory(self, material_updates: Optional[Dict]):
        """Update Material & Inventory Management when materials are consumed."""
        if not material_updates:
            return
        for item_name, qty in material_updates.items():
            if qty is None:
                continue
            item = self.db.query(Inventory).filter(Inventory.item_name == item_name).first()
            if item:
                item.quantity = max(0.0, (item.quantity or 0.0) - float(qty))
            else:
                # Consumed item not in inventory -> log as a negative adjustment row.
                self.db.add(Inventory(item_name=item_name, quantity=-abs(float(qty))))
        self.db.commit()

    def _update_attendance(self, report_date: str, worker_attendance: Optional[str], worker_count: int):
        """Create/update worker attendance records from a daily report."""
        if not worker_attendance or worker_count <= 0:
            return
        record = Attendance(
            user_name=worker_attendance,
            date=report_date,
            day_name="",
            shift_type="Day",
            status="Present",
            hours_worked=0.0,
            location="Site",
        )
        self.db.add(record)
        self.db.commit()

    def _update_budget(self, project_id: str, cost_incurred: float, work_completed: str):
        """Record cost against the project budget via the procurement module."""
        if not cost_incurred or cost_incurred <= 0:
            return
        self.db.add(Procurement(
            title=f"Site progress cost: {work_completed[:80]}",
            amount=float(cost_incurred),
        ))
        self.db.commit()

    def _create_notification(self, title: str, message: str, category: str = "Milestone", ntype: str = "info"):
        self.db.add(Notification(
            title=title,
            message=message,
            notification_type=ntype,
            category=category,
            time="Just now",
            is_read=False,
        ))
        self.db.commit()

    # ------------------------------------------------------------------
    # Daily Progress Reports
    # ------------------------------------------------------------------
    def _to_daily_read(self, r: DailyProgressReport) -> DailyProgressReportRead:
        photos = [
            ProgressPhotographRead(
                id=p.id,
                reportId=p.report_id,
                photoUrl=p.photo_url,
                caption=p.caption,
                uploadedBy=p.uploaded_by,
            )
            for p in (r.photographs or [])
        ]
        return DailyProgressReportRead(
            id=r.id,
            projectId=r.project_id,
            reportDate=r.report_date,
            progressCategory=r.progress_category,
            workCompleted=r.work_completed,
            progressPercentage=r.progress_percentage,
            contractor=r.contractor,
            workerAttendance=r.worker_attendance,
            workerCount=r.worker_count,
            workerAbsent=r.worker_absent,
            workerHours=r.worker_hours,
            machineryUsed=r.machinery_used,
            materialsConsumed=r.materials_consumed,
            materialUpdates=r.material_updates,
            costIncurred=r.cost_incurred,
            weatherConditions=r.weather_conditions,
            safetyObservations=r.safety_observations,
            qualityInspectionRemarks=r.quality_inspection_remarks,
            delays=r.delays,
            delayReasons=r.delay_reasons,
            comments=r.comments,
            reportedBy=r.reported_by,
            status=r.status,
            photographs=photos,
        )

    def get_daily_reports(self, project_id: Optional[str] = None) -> List[DailyProgressReportRead]:
        if project_id:
            self._require_project(project_id)
            reports = self.daily_repo.get_by_project(project_id)
        else:
            reports = self.daily_repo.get_all()
        return [self._to_daily_read(r) for r in reports]

    def get_daily_report(self, report_id: str) -> DailyProgressReportRead:
        r = self.daily_repo.get_by_id(report_id)
        if not r:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Daily progress report not found")
        return self._to_daily_read(r)

    def create_daily_report(self, req: DailyProgressReportCreate, user_name: str, user_id: str) -> DailyProgressReportRead:
        self._require_project(req.projectId, require_open=True)
        new_report = DailyProgressReport(
            project_id=req.projectId,
            report_date=req.reportDate,
            progress_category=req.progressCategory,
            work_completed=req.workCompleted,
            progress_percentage=req.progressPercentage,
            contractor=req.contractor,
            worker_attendance=req.workerAttendance,
            worker_count=req.workerCount or 0,
            worker_absent=req.workerAbsent or 0,
            worker_hours=req.workerHours or 0.0,
            machinery_used=req.machineryUsed,
            materials_consumed=req.materialsConsumed,
            material_updates=req.materialUpdates,
            cost_incurred=req.costIncurred or 0.0,
            weather_conditions=req.weatherConditions or "Sunny",
            safety_observations=req.safetyObservations,
            quality_inspection_remarks=req.qualityInspectionRemarks,
            delays=req.delays,
            delay_reasons=req.delayReasons,
            comments=req.comments,
            reported_by=user_name,
            reported_by_id=user_id,
            status="Pending",
        )
        created = self.daily_repo.create(new_report)

        # Attach progress photographs if provided
        for url in (req.photographUrls or []):
            if url and url.strip():
                photo = ProgressPhotograph(
                    report_id=created.id,
                    photo_url=url.strip(),
                    uploaded_by=user_name,
                )
                self.photo_repo.create(photo)

        # Cross-module integration: update inventory, attendance, budget.
        self._update_inventory(req.materialUpdates)
        self._update_attendance(req.reportDate, req.workerAttendance, req.workerCount or 0)
        self._update_budget(created.project_id, req.costIncurred or 0.0, req.workCompleted)

        # Notify on delays detected in a daily report.
        if req.delays:
            self._create_notification(
                title="Project Delay Flagged",
                message=f"Delay on {req.reportDate}: {req.delayReasons or 'No reason specified'}",
                category="Delay",
                ntype="warning",
            )

        self.recompute_completion(created.project_id)
        self.sync_milestones_from_reports(created.project_id)
        return self.get_daily_report(created.id)

    def update_daily_report(self, report_id: str, updates: DailyProgressReportUpdate) -> DailyProgressReportRead:
        r = self.daily_repo.get_by_id(report_id)
        if not r:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Daily progress report not found")
        self._verify_project_not_closed(r.project_id)

        if updates.reportDate is not None: r.report_date = updates.reportDate
        if updates.progressCategory is not None:
            if updates.progressCategory not in PROGRESS_CATEGORIES:
                raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid progress category")
            r.progress_category = updates.progressCategory
        if updates.workCompleted is not None: r.work_completed = updates.workCompleted
        if updates.progressPercentage is not None: r.progress_percentage = updates.progressPercentage
        if updates.contractor is not None: r.contractor = updates.contractor
        if updates.workerAttendance is not None: r.worker_attendance = updates.workerAttendance
        if updates.workerCount is not None: r.worker_count = updates.workerCount
        if updates.workerAbsent is not None: r.worker_absent = updates.workerAbsent
        if updates.workerHours is not None: r.worker_hours = updates.workerHours
        if updates.machineryUsed is not None: r.machinery_used = updates.machineryUsed
        if updates.materialsConsumed is not None: r.materials_consumed = updates.materialsConsumed
        if updates.weatherConditions is not None: r.weather_conditions = updates.weatherConditions
        if updates.safetyObservations is not None: r.safety_observations = updates.safetyObservations
        if updates.qualityInspectionRemarks is not None: r.quality_inspection_remarks = updates.qualityInspectionRemarks
        if updates.delays is not None: r.delays = updates.delays
        if updates.delayReasons is not None: r.delay_reasons = updates.delayReasons
        if updates.comments is not None: r.comments = updates.comments
        if updates.status is not None: r.status = updates.status

        updated = self.daily_repo.update(r)
        self.recompute_completion(updated.project_id)
        self.sync_milestones_from_reports(updated.project_id)
        return self.get_daily_report(updated.id)

    def delete_daily_report(self, report_id: str) -> bool:
        r = self.daily_repo.get_by_id(report_id)
        if not r:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Daily progress report not found")
        self._verify_project_not_closed(r.project_id)
        project_id = r.project_id
        self.daily_repo.delete(r)
        self.recompute_completion(project_id)
        self.sync_milestones_from_reports(project_id)
        return True

    # ------------------------------------------------------------------
    # Weekly Progress Reports
    # ------------------------------------------------------------------
    def _to_weekly_read(self, w: WeeklyProgressReport) -> WeeklyProgressReportRead:
        return WeeklyProgressReportRead(
            id=w.id,
            projectId=w.project_id,
            weekStartDate=w.week_start_date,
            weekEndDate=w.week_end_date,
            completedWork=w.completed_work,
            weeklyProgressPercentage=w.weekly_progress_percentage,
            plannedProgressPercentage=getattr(w, 'planned_progress_percentage', 0) or 0,
            nextWeekTargets=getattr(w, 'next_week_targets', None),
            workerHours=w.worker_hours,
            workerCount=w.worker_count,
            majorActivities=w.major_activities,
            delays=w.delays,
            safetyIncidents=w.safety_incidents,
            overallStatus=w.overall_status,
            generatedBy=w.generated_by,
        )

    def get_weekly_reports(self, project_id: Optional[str] = None) -> List[WeeklyProgressReportRead]:
        if project_id:
            self._require_project(project_id)
            reports = self.weekly_repo.get_by_project(project_id)
        else:
            reports = self.weekly_repo.get_all()
        return [self._to_weekly_read(w) for w in reports]

    def get_weekly_report(self, report_id: str) -> WeeklyProgressReportRead:
        w = self.weekly_repo.get_by_id(report_id)
        if not w:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Weekly progress report not found")
        return self._to_weekly_read(w)

    def create_weekly_report(self, req: WeeklyProgressReportCreate, user_name: str) -> WeeklyProgressReportRead:
        self._require_project(req.projectId, require_open=True)
        # Aggregate daily reports in the week range to auto-fill summary fields.
        daily_reports = self.daily_repo.get_in_date_range(req.projectId, req.weekStartDate, req.weekEndDate)
        if daily_reports:
            completed_work = "\n".join(
                f"- [{d.report_date}] {d.progress_category}: {d.work_completed}" for d in daily_reports
            )
            major_activities = ", ".join(sorted({d.progress_category for d in daily_reports}))
            delayed_days = [d.report_date for d in daily_reports if d.delays]
            delays_text = (
                "; ".join(f"{d.delay_reasons} ({d.report_date})" for d in daily_reports if d.delays)
                if delayed_days else "No delays recorded"
            )
            avg_progress = round(sum(d.progress_percentage for d in daily_reports) / len(daily_reports))
            weekly_percentage = req.weeklyProgressPercentage if req.weeklyProgressPercentage is not None else avg_progress
            total_worker_hours = round(sum((d.worker_hours or 0.0) for d in daily_reports), 2)
            total_worker_count = sum((d.worker_count or 0) for d in daily_reports)
        else:
            completed_work = req.completedWork or "No daily progress reports recorded for this week."
            major_activities = req.majorActivities or ""
            delays_text = req.delays or "No delays recorded"
            weekly_percentage = req.weeklyProgressPercentage if req.weeklyProgressPercentage is not None else 0
            total_worker_hours = 0.0
            total_worker_count = 0

        new_weekly = WeeklyProgressReport(
            project_id=req.projectId,
            week_start_date=req.weekStartDate,
            week_end_date=req.weekEndDate,
            completed_work=req.completedWork or completed_work,
            weekly_progress_percentage=weekly_percentage,
            planned_progress_percentage=req.plannedProgressPercentage or 0,
            next_week_targets=req.nextWeekTargets or "",
            worker_hours=req.workerHours if req.workerHours is not None else total_worker_hours,
            worker_count=req.workerCount if req.workerCount is not None else total_worker_count,
            major_activities=req.majorActivities or major_activities,
            delays=req.delays or delays_text,
            safety_incidents=req.safetyIncidents,
            overall_status=req.overallStatus or "On Track",
            generated_by=user_name,
        )
        created = self.weekly_repo.create(new_weekly)
        return self._to_weekly_read(created)

    def delete_weekly_report(self, report_id: str) -> bool:
        w = self.weekly_repo.get_by_id(report_id)
        if not w:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Weekly progress report not found")
        self._verify_project_not_closed(w.project_id)
        self.weekly_repo.delete(w)
        return True

    # ------------------------------------------------------------------
    # Work Completion Status (auto-computed)
    # ------------------------------------------------------------------
    def recompute_completion(self, project_id: str) -> WorkCompletionStatusRead:
        reports = self.daily_repo.get_by_project(project_id)
        category_max: Dict[str, int] = {}
        for r in reports:
            current = category_max.get(r.progress_category, 0)
            if r.progress_percentage > current:
                category_max[r.progress_category] = r.progress_percentage

        weight_sum = sum(self.CATEGORY_WEIGHTS.values()) or 1.0
        weighted_sum = 0.0
        for cat, pct in category_max.items():
            w = self.CATEGORY_WEIGHTS.get(cat, 1.0 / len(self.CATEGORY_WEIGHTS))
            weighted_sum += w * pct

        if not category_max:
            overall = 0
        else:
            overall = round(weighted_sum / weight_sum)

        status_obj = self.completion_repo.upsert(project_id, overall, category_max)
        return WorkCompletionStatusRead(
            id=status_obj.id,
            projectId=status_obj.project_id,
            overallCompletionPercentage=status_obj.overall_completion_percentage,
            categoryBreakdown=status_obj.category_breakdown,
            computedAt=status_obj.computed_at.isoformat() if status_obj.computed_at else None,
        )

    def get_completion_status(self, project_id: Optional[str] = None) -> List[WorkCompletionStatusRead]:
        if project_id:
            self._require_project(project_id)
            status_obj = self.completion_repo.get_by_project(project_id)
            if not status_obj:
                status_obj = self.completion_repo.upsert(project_id, 0, {})
            return [self._to_completion_read(status_obj)]
        statuses = self.db.query(Project).all()
        result = []
        for proj in statuses:
            st = self.completion_repo.get_by_project(proj.id)
            if not st:
                st = self.completion_repo.upsert(proj.id, 0, {})
            result.append(self._to_completion_read(st))
        return result

    def _to_completion_read(self, status_obj) -> WorkCompletionStatusRead:
        return WorkCompletionStatusRead(
            id=status_obj.id,
            projectId=status_obj.project_id,
            overallCompletionPercentage=status_obj.overall_completion_percentage,
            categoryBreakdown=status_obj.category_breakdown,
            computedAt=status_obj.computed_at.isoformat() if status_obj.computed_at else None,
        )

    # ------------------------------------------------------------------
    # Milestone Tracking (reuses existing project_milestones table)
    # ------------------------------------------------------------------
    def sync_milestones_from_reports(self, project_id: str) -> List[MilestoneTrackingRead]:
        from datetime import date
        milestones = self.db.query(ProjectMilestone).filter(ProjectMilestone.project_id == project_id).all()
        reports = self.daily_repo.get_by_project(project_id)
        category_max: Dict[str, int] = {}
        for r in reports:
            current = category_max.get(r.progress_category, 0)
            if r.progress_percentage > current:
                category_max[r.progress_category] = r.progress_percentage

        result = []
        for ms in milestones:
            keyword = (ms.milestone_name or "").lower()
            matched_pct = None
            for cat, pct in category_max.items():
                if cat.lower() in keyword or keyword in cat.lower():
                    matched_pct = max(matched_pct or 0, pct)

            if matched_pct is not None and matched_pct > ms.completion_percentage:
                ms.completion_percentage = matched_pct
            if ms.completion_percentage >= 100:
                ms.status = "Completed"
                if not ms.actual_completion_date:
                    ms.actual_completion_date = date.today().isoformat()
            elif ms.completion_percentage > 0:
                ms.status = "In Progress"
            else:
                ms.status = "Pending"
            self.db.commit()
            result.append(self._to_milestone_read(ms))
        return result

    def update_milestone(self, milestone_id: str, updates) -> MilestoneTrackingRead:
        from datetime import date
        ms = self.db.query(ProjectMilestone).filter(ProjectMilestone.id == milestone_id).first()
        if not ms:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
        if updates.completionPercentage is not None:
            ms.completion_percentage = updates.completionPercentage
        if updates.status is not None:
            ms.status = updates.status
        if updates.plannedDate is not None:
            ms.planned_date = updates.plannedDate
        if updates.actualCompletionDate is not None:
            ms.actual_completion_date = updates.actualCompletionDate

        if ms.completion_percentage >= 100 or ms.status == "Completed":
            ms.status = "Completed"
            if not ms.actual_completion_date:
                ms.actual_completion_date = date.today().isoformat()

        self.db.commit()
        self.db.refresh(ms)
        return self._to_milestone_read(ms)

    def _to_milestone_read(self, ms) -> MilestoneTrackingRead:
        category = None
        name_lower = (ms.milestone_name or "").lower()
        for cat in PROGRESS_CATEGORIES:
            if cat.lower() in name_lower or name_lower in cat.lower():
                category = cat
                break
        return MilestoneTrackingRead(
            id=ms.id,
            projectId=ms.project_id,
            milestoneName=ms.milestone_name,
            description=ms.description,
            plannedDate=ms.planned_date,
            actualCompletionDate=ms.actual_completion_date,
            completionPercentage=ms.completion_percentage,
            status=ms.status,
            category=category,
        )

    def get_milestone_tracking(self, project_id: Optional[str] = None) -> List[MilestoneTrackingRead]:
        if project_id:
            self._require_project(project_id)
            milestones = self.db.query(ProjectMilestone).filter(ProjectMilestone.project_id == project_id).all()
        else:
            milestones = self.db.query(ProjectMilestone).all()
        return [self._to_milestone_read(ms) for ms in milestones]

    # ------------------------------------------------------------------
    # Delay Tracking
    # ------------------------------------------------------------------
    def _to_delay_read(self, d: DelayTracking) -> DelayTrackingRead:
        return DelayTrackingRead(
            id=d.id,
            projectId=d.project_id,
            reason=d.reason,
            durationDays=d.duration_days,
            affectedWorkCategory=d.affected_work_category,
            category=getattr(d, 'category', 'Weather') or 'Weather',
            severity=getattr(d, 'severity', 'High') or 'High',
            mitigation=getattr(d, 'mitigation', None),
            impactOnTimeline=d.impact_on_timeline,
            reportedDate=d.reported_date,
            reportedBy=d.reported_by,
            remarks=d.remarks,
            status=d.status,
        )

    def get_delays(self, project_id: Optional[str] = None) -> List[DelayTrackingRead]:
        if project_id:
            self._require_project(project_id)
            delays = self.delay_repo.get_by_project(project_id)
        else:
            delays = self.delay_repo.get_all()
        return [self._to_delay_read(d) for d in delays]

    def create_delay(self, req: DelayTrackingCreate, user_name: str) -> DelayTrackingRead:
        self._require_project(req.projectId, require_open=True)
        new_delay = DelayTracking(
            project_id=req.projectId,
            reason=req.reason,
            duration_days=req.durationDays,
            affected_work_category=req.affectedWorkCategory,
            category=req.category or "Weather",
            severity=req.severity or "High",
            mitigation=req.mitigation,
            impact_on_timeline=req.impactOnTimeline,
            reported_date=req.reportedDate,
            reported_by=user_name,
            remarks=req.remarks,
            status=req.status or "Open",
        )
        created = self.delay_repo.create(new_delay)
        return self._to_delay_read(created)

    def update_delay(self, delay_id: str, updates: DelayTrackingUpdate) -> DelayTrackingRead:
        d = self.delay_repo.get_by_id(delay_id)
        if not d:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delay record not found")
        self._verify_project_not_closed(d.project_id)
        if updates.reason is not None: d.reason = updates.reason
        if updates.durationDays is not None: d.duration_days = updates.durationDays
        if updates.affectedWorkCategory is not None: d.affected_work_category = updates.affectedWorkCategory
        if updates.category is not None: d.category = updates.category
        if updates.severity is not None: d.severity = updates.severity
        if updates.mitigation is not None: d.mitigation = updates.mitigation
        if updates.impactOnTimeline is not None: d.impact_on_timeline = updates.impactOnTimeline
        if updates.reportedDate is not None: d.reported_date = updates.reportedDate
        if updates.remarks is not None: d.remarks = updates.remarks
        if updates.status is not None: d.status = updates.status
        updated = self.delay_repo.update(d)
        return self._to_delay_read(updated)

    def delete_delay(self, delay_id: str) -> bool:
        d = self.delay_repo.get_by_id(delay_id)
        if not d:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delay record not found")
        self._verify_project_not_closed(d.project_id)
        self.delay_repo.delete(d)
        return True

    # ------------------------------------------------------------------
    # Site Activity Logs
    # ------------------------------------------------------------------
    def _to_activity_read(self, a: SiteActivityLog) -> SiteActivityLogRead:
        return SiteActivityLogRead(
            id=a.id,
            projectId=a.project_id,
            activityDate=a.activity_date,
            activityTime=a.activity_time,
            description=a.description,
            eventType=a.event_type,
            responsiblePerson=a.responsible_person,
            location=getattr(a, 'location', None),
            workersCount=getattr(a, 'workers_count', 0) or 0,
            weather=getattr(a, 'weather', 'Sunny') or 'Sunny',
        )

    def get_activity_logs(self, project_id: Optional[str] = None) -> List[SiteActivityLogRead]:
        if project_id:
            self._require_project(project_id)
            logs = self.activity_repo.get_by_project(project_id)
        else:
            logs = self.activity_repo.get_all()
        return [self._to_activity_read(a) for a in logs]

    def create_activity_log(self, req: SiteActivityLogCreate, user_name: str) -> SiteActivityLogRead:
        self._require_project(req.projectId, require_open=True)
        new_log = SiteActivityLog(
            project_id=req.projectId,
            activity_date=req.activityDate,
            activity_time=req.activityTime,
            description=req.description,
            event_type=req.eventType,
            responsible_person=req.responsiblePerson,
            location=req.location,
            workers_count=req.workersCount or 0,
            weather=req.weather or "Sunny",
        )
        created = self.activity_repo.create(new_log)
        return self._to_activity_read(created)

    def update_activity_log(self, log_id: str, updates: SiteActivityLogUpdate) -> SiteActivityLogRead:
        a = self.activity_repo.get_by_id(log_id)
        if not a:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site activity log not found")
        self._verify_project_not_closed(a.project_id)
        if updates.activityDate is not None: a.activity_date = updates.activityDate
        if updates.activityTime is not None: a.activity_time = updates.activityTime
        if updates.description is not None: a.description = updates.description
        if updates.eventType is not None: a.event_type = updates.eventType
        if updates.responsiblePerson is not None: a.responsible_person = updates.responsiblePerson
        if updates.location is not None: a.location = updates.location
        if updates.workersCount is not None: a.workers_count = updates.workersCount
        if updates.weather is not None: a.weather = updates.weather
        updated = self.activity_repo.update(a)
        return self._to_activity_read(updated)

    def delete_activity_log(self, log_id: str) -> bool:
        a = self.activity_repo.get_by_id(log_id)
        if not a:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site activity log not found")
        self._verify_project_not_closed(a.project_id)
        self.activity_repo.delete(a)
        return True

    # ------------------------------------------------------------------
    # Progress Photographs
    # ------------------------------------------------------------------
    def add_photograph(self, req: ProgressPhotographCreate, user_name: str) -> ProgressPhotographRead:
        report = self.daily_repo.get_by_id(req.reportId)
        if not report:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Daily progress report not found")
        self._verify_project_not_closed(report.project_id)
        photo = ProgressPhotograph(
            report_id=req.reportId,
            photo_url=req.photoUrl,
            caption=req.caption,
            uploaded_by=user_name,
        )
        created = self.photo_repo.create(photo)
        return ProgressPhotographRead(
            id=created.id,
            reportId=created.report_id,
            photoUrl=created.photo_url,
            caption=created.caption,
            uploadedBy=created.uploaded_by,
        )

    def get_photographs(self, report_id: str) -> List[ProgressPhotographRead]:
        photos = self.photo_repo.get_by_report(report_id)
        return [
            ProgressPhotographRead(
                id=p.id,
                reportId=p.report_id,
                photoUrl=p.photo_url,
                caption=p.caption,
                uploadedBy=p.uploaded_by,
            )
            for p in photos
        ]

    def delete_photograph(self, photo_id: str) -> bool:
        photo = self.photo_repo.get_by_id(photo_id)
        if photo:
            report = self.daily_repo.get_by_id(photo.report_id)
            if report:
                self._verify_project_not_closed(report.project_id)
        self.photo_repo.delete(photo_id)
        return True

    # ------------------------------------------------------------------
    # Dashboard summary
    # ------------------------------------------------------------------
    def get_dashboard(self, project_id: str) -> SiteProgressDashboardRead:
        self._require_project(project_id)
        proj = self.db.query(Project).filter(Project.id == project_id).first()

        completion = self.get_completion_status(project_id)[0]
        reports = self.daily_repo.get_by_project(project_id)
        milestones = self.db.query(ProjectMilestone).filter(ProjectMilestone.project_id == project_id).all()
        delays = self.delay_repo.get_by_project(project_id)
        activities = self.activity_repo.get_by_project(project_id)

        milestone_counts = {
            "total": len(milestones),
            "pending": sum(1 for m in milestones if m.status == "Pending"),
            "inProgress": sum(1 for m in milestones if m.status == "In Progress"),
            "completed": sum(1 for m in milestones if m.status == "Completed"),
            "delayed": sum(1 for m in milestones if m.status == "Delayed"),
        }
        delay_counts = {
            "total": len(delays),
            "open": sum(1 for d in delays if d.status == "Open"),
            "resolved": sum(1 for d in delays if d.status == "Resolved"),
            "critical": sum(1 for d in delays if (getattr(d, 'severity', '') or '').lower() == 'high'),
            "totalDurationDays": sum(d.duration_days for d in delays),
        }

        return SiteProgressDashboardRead(
            projectId=project_id,
            projectName=proj.project_name if proj else None,
            overallCompletionPercentage=completion.overallCompletionPercentage,
            categoryBreakdown=completion.categoryBreakdown,
            milestones=milestone_counts,
            delays=delay_counts,
            dailyReportCount=len(reports),
            recentReports=[self._to_daily_read(r) for r in reports[:5]],
            recentActivities=[self._to_activity_read(a) for a in activities[:8]],
        )

