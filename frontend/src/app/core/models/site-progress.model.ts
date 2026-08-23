export const PROGRESS_CATEGORIES = [
  'Civil Work',
  'Foundation',
  'Structural Work',
  'Electrical Work',
  'Plumbing Work',
  'Finishing Work',
  'Inspection Work',
] as const;

export const ACTIVITY_EVENT_TYPES = [
  'Material Arrival',
  'Material Delivery',
  'Machinery Maintenance',
  'Equipment Servicing',
  'Safety Training',
  'Safety Meeting',
  'Client Visit',
  'Government Inspection',
  'Inspection',
  'Quality Audit',
  'Accident Report',
  'Accident',
  'Contractor Meeting',
  'Other Site Event',
] as const;

export type ProgressCategory = typeof PROGRESS_CATEGORIES[number];
export type ActivityEventType = typeof ACTIVITY_EVENT_TYPES[number];

export interface DailyProgressReport {
  id: string;
  projectId: string;
  reportDate: string;
  progressCategory: string;
  workCompleted: string;
  progressPercentage: number;
  contractor?: string;
  workerAttendance?: string;
  workerCount?: number;
  workerAbsent?: number;
  workerHours?: number;
  machineryUsed?: string;
  materialsConsumed?: string;
  weatherConditions: string;
  safetyObservations?: string;
  qualityInspectionRemarks?: string;
  delays: boolean;
  delayReasons?: string;
  comments?: string;
  reportedBy: string;
  status: string;
  photographs?: ProgressPhotograph[];
}

export interface ProgressPhotograph {
  id: string;
  reportId: string;
  photoUrl: string;
  caption?: string;
  uploadedBy: string;
}

export interface WeeklyProgressReport {
  id: string;
  projectId: string;
  weekStartDate: string;
  weekEndDate: string;
  completedWork?: string;
  weeklyProgressPercentage: number;
  plannedProgressPercentage?: number;
  nextWeekTargets?: string;
  workerHours?: number;
  workerCount?: number;
  majorActivities?: string;
  delays?: string;
  safetyIncidents?: string;
  overallStatus: string;
  generatedBy: string;
}

export interface WorkCompletionStatus {
  id: string;
  projectId: string;
  overallCompletionPercentage: number;
  categoryBreakdown?: Record<string, number>;
  computedAt?: string;
}

export interface DelayTracking {
  id: string;
  projectId: string;
  reason: string;
  durationDays: number;
  affectedWorkCategory: string;
  category?: string;
  severity?: string;
  mitigation?: string;
  impactOnTimeline?: string;
  reportedDate: string;
  reportedBy: string;
  remarks?: string;
  status: string;
}

export interface SiteActivityLog {
  id: string;
  projectId: string;
  activityDate: string;
  activityTime?: string;
  description: string;
  eventType: string;
  responsiblePerson: string;
  location?: string;
  workersCount?: number;
  weather?: string;
}

export interface SiteProgressDashboard {
  projectId: string;
  projectName?: string;
  overallCompletionPercentage: number;
  categoryBreakdown?: Record<string, number>;
  milestones: { total: number; pending: number; inProgress: number; completed: number; delayed: number };
  delays: { total: number; open: number; resolved: number; totalDurationDays: number };
  dailyReportCount: number;
  recentReports: DailyProgressReport[];
  recentActivities: SiteActivityLog[];
}
