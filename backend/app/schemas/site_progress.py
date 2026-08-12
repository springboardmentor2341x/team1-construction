from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any

PROGRESS_CATEGORIES = [
    "Foundation",
    "Structural Work",
    "Electrical Work",
    "Plumbing Work",
    "Finishing Work",
    "Inspection Work",
]

ACTIVITY_EVENT_TYPES = [
    "Material Arrival",
    "Material Delivery",
    "Machinery Maintenance",
    "Equipment Servicing",
    "Safety Training",
    "Safety Meeting",
    "Client Visit",
    "Government Inspection",
    "Inspection",
    "Quality Audit",
    "Accident Report",
    "Accident",
    "Contractor Meeting",
    "Other Site Event",
]


class DailyProgressReportCreate(BaseModel):
    projectId: str
    reportDate: str
    progressCategory: str
    workCompleted: str
    progressPercentage: int = Field(default=0, ge=0, le=100)
    contractor: Optional[str] = None
    workerAttendance: Optional[str] = None
    workerCount: Optional[int] = Field(default=0, ge=0)
    workerAbsent: Optional[int] = Field(default=0, ge=0)
    workerHours: Optional[float] = Field(default=0.0, ge=0.0)
    machineryUsed: Optional[str] = None
    materialsConsumed: Optional[str] = None
    materialUpdates: Optional[Dict[str, Any]] = None
    costIncurred: Optional[float] = Field(default=0.0, ge=0.0)
    weatherConditions: str = "Sunny"
    safetyObservations: Optional[str] = None
    qualityInspectionRemarks: Optional[str] = None
    delays: bool = False
    delayReasons: Optional[str] = None
    comments: Optional[str] = None
    photographUrls: Optional[List[str]] = None

    @field_validator("progressCategory")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in PROGRESS_CATEGORIES:
            raise ValueError(f"progressCategory must be one of {PROGRESS_CATEGORIES}")
        return v


class DailyProgressReportUpdate(BaseModel):
    reportDate: Optional[str] = None
    progressCategory: Optional[str] = None
    workCompleted: Optional[str] = None
    progressPercentage: Optional[int] = Field(default=None, ge=0, le=100)
    contractor: Optional[str] = None
    workerAttendance: Optional[str] = None
    workerCount: Optional[int] = Field(default=None, ge=0)
    workerAbsent: Optional[int] = Field(default=None, ge=0)
    workerHours: Optional[float] = Field(default=None, ge=0.0)
    machineryUsed: Optional[str] = None
    materialsConsumed: Optional[str] = None
    materialUpdates: Optional[Dict[str, Any]] = None
    costIncurred: Optional[float] = Field(default=None, ge=0.0)
    weatherConditions: Optional[str] = None
    safetyObservations: Optional[str] = None
    qualityInspectionRemarks: Optional[str] = None
    delays: Optional[bool] = None
    delayReasons: Optional[str] = None
    comments: Optional[str] = None
    status: Optional[str] = None


class ProgressPhotographRead(BaseModel):
    id: str
    reportId: str
    photoUrl: str
    caption: Optional[str] = None
    uploadedBy: str

    class Config:
        from_attributes = True


class DailyProgressReportRead(BaseModel):
    id: str
    projectId: str
    reportDate: str
    progressCategory: str
    workCompleted: str
    progressPercentage: int
    contractor: Optional[str] = None
    workerAttendance: Optional[str] = None
    workerCount: Optional[int] = None
    workerAbsent: Optional[int] = None
    workerHours: Optional[float] = None
    machineryUsed: Optional[str] = None
    materialsConsumed: Optional[str] = None
    materialUpdates: Optional[Dict[str, Any]] = None
    costIncurred: Optional[float] = None
    weatherConditions: str
    safetyObservations: Optional[str] = None
    qualityInspectionRemarks: Optional[str] = None
    delays: bool
    delayReasons: Optional[str] = None
    comments: Optional[str] = None
    reportedBy: str
    status: str
    photographs: List[ProgressPhotographRead] = []

    class Config:
        from_attributes = True


class WeeklyProgressReportCreate(BaseModel):
    projectId: str
    weekStartDate: str
    weekEndDate: str
    completedWork: Optional[str] = None
    weeklyProgressPercentage: Optional[int] = Field(default=None, ge=0, le=100)
    workerHours: Optional[float] = Field(default=None, ge=0.0)
    workerCount: Optional[int] = Field(default=None, ge=0)
    majorActivities: Optional[str] = None
    delays: Optional[str] = None
    safetyIncidents: Optional[str] = None
    overallStatus: str = "On Track"


class WeeklyProgressReportRead(BaseModel):
    id: str
    projectId: str
    weekStartDate: str
    weekEndDate: str
    completedWork: Optional[str] = None
    weeklyProgressPercentage: int
    workerHours: Optional[float] = None
    workerCount: Optional[int] = None
    majorActivities: Optional[str] = None
    delays: Optional[str] = None
    safetyIncidents: Optional[str] = None
    overallStatus: str
    generatedBy: str

    class Config:
        from_attributes = True


class WorkCompletionStatusRead(BaseModel):
    id: str
    projectId: str
    overallCompletionPercentage: int
    categoryBreakdown: Optional[Dict[str, int]] = None
    computedAt: Optional[str] = None

    class Config:
        from_attributes = True


class DelayTrackingCreate(BaseModel):
    projectId: str
    reason: str
    durationDays: int = Field(default=0, ge=0)
    affectedWorkCategory: str
    impactOnTimeline: Optional[str] = None
    reportedDate: str
    remarks: Optional[str] = None
    status: str = "Open"


class DelayTrackingUpdate(BaseModel):
    reason: Optional[str] = None
    durationDays: Optional[int] = Field(default=None, ge=0)
    affectedWorkCategory: Optional[str] = None
    impactOnTimeline: Optional[str] = None
    reportedDate: Optional[str] = None
    remarks: Optional[str] = None
    status: Optional[str] = None


class DelayTrackingRead(BaseModel):
    id: str
    projectId: str
    reason: str
    durationDays: int
    affectedWorkCategory: str
    impactOnTimeline: Optional[str] = None
    reportedDate: str
    reportedBy: str
    remarks: Optional[str] = None
    status: str

    class Config:
        from_attributes = True


class SiteActivityLogCreate(BaseModel):
    projectId: str
    activityDate: str
    activityTime: Optional[str] = None
    description: str
    eventType: str
    responsiblePerson: str

    @field_validator("eventType")
    @classmethod
    def validate_event_type(cls, v: str) -> str:
        if v not in ACTIVITY_EVENT_TYPES:
            raise ValueError(f"eventType must be one of {ACTIVITY_EVENT_TYPES}")
        return v


class SiteActivityLogUpdate(BaseModel):
    activityDate: Optional[str] = None
    activityTime: Optional[str] = None
    description: Optional[str] = None
    eventType: Optional[str] = None
    responsiblePerson: Optional[str] = None


class SiteActivityLogRead(BaseModel):
    id: str
    projectId: str
    activityDate: str
    activityTime: Optional[str] = None
    description: str
    eventType: str
    responsiblePerson: str

    class Config:
        from_attributes = True


class ProgressPhotographCreate(BaseModel):
    reportId: str
    photoUrl: str
    caption: Optional[str] = None


class MilestoneTrackingRead(BaseModel):
    id: str
    projectId: str
    milestoneName: str
    description: Optional[str] = None
    plannedDate: str
    actualCompletionDate: Optional[str] = None
    completionPercentage: int
    status: str
    category: Optional[str] = None


class MilestoneUpdate(BaseModel):
    completionPercentage: Optional[int] = Field(default=None, ge=0, le=100)
    status: Optional[str] = None
    plannedDate: Optional[str] = None
    actualCompletionDate: Optional[str] = None


class SiteProgressDashboardRead(BaseModel):
    projectId: str
    projectName: Optional[str] = None
    overallCompletionPercentage: int
    categoryBreakdown: Optional[Dict[str, int]] = None
    milestones: dict = {}
    delays: dict = {}
    dailyReportCount: int
    recentReports: List[DailyProgressReportRead] = []
    recentActivities: List[SiteActivityLogRead] = []

