export interface ProjectSchedule {
  id: string;
  projectId: string;
  phaseName: string;
  description: string;
  plannedStartDate: string;
  plannedEndDate: string;
  estimatedDurationDays: number;
}
